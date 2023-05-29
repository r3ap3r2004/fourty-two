require 'action_dispatch/routing/inspector'

namespace :coverage do
  # Check for missing specs
  #
  # Usage to see the list of missing specs:
  #   rails coverage:basic
  #
  # Usage with pass/fail for specific threshold:
  #   rails coverage:basic[90.0]
  #
  desc 'Check the spec coverage'
  task :basic, [:threshold] => :environment do |_t, args|
    args.with_defaults(threshold: 0.0)
    threshold = args[:threshold].to_f.round(2)
    Coverage::Verifier.new.check_requests(threshold)
  end
end

module Coverage
  class Verifier
    def check_requests(threshold)
      verifier = RequestVerifier.new
      missing = verifier.missing
      coverage = verifier.coverage

      if threshold.positive?
        check_request_coverage_for_ci(missing, coverage, threshold)
      else
        check_request_coverage(missing, coverage)
      end
    end

    # CI just wants to know if we pass the threshold
    def check_request_coverage_for_ci(missing, coverage, threshold)
      RoutesPrinter.new(missing).print
      return unless coverage < threshold

      msg = "Request coverage under minimum #{coverage}/#{threshold}%"
      raise "\n\e[31m#{msg}\e[0m"
    end

    # Humans want to read what's missing
    def check_request_coverage(missing, coverage)
      if missing.length.positive?
        puts "\n-------MISSING REQUESTS--------"
        RoutesPrinter.new(missing).print
      end
      puts "\n\e[32m#{coverage}% of routes covered\e[0m"
    end
  end

  # Match up the list of available routes with the routes that we actually
  # test out our spec/requests/** Rails integration style specs
  #
  class RequestVerifier
    def initialize
      app_routes = Rails.application.routes.routes
      req_specs  = Rails.root.join('spec/requests/**/*_spec.rb')

      routes   = RouteList.new(app_routes)
      requests = RequestList.new(req_specs)
      @coverage = build_coverage(routes, requests)
    end

    def covered
      @coverage.select { |_route, value| value }.map { |k, _v| k }
    end

    def missing
      @coverage.reject { |_route, value| value }.map { |k, _v| k }
    end

    def coverage
      (covered.count / @coverage.count.to_f * 100).round(2)
    end

    private

    def build_coverage(routes, requests)
      routes.index_with { |r| requests.covered?(r[:verb], r[:name]) }
    end
  end

  # Build up a list of all the routes available in the app.
  # Builds an enumerable collection in the format:
  #
  #   [
  #     { verb: POST, name: api_v1_session }
  #   ]
  #
  class RouteList
    include Enumerable

    def initialize(app_routes)
      @routes = collect_routes(app_routes)
    end

    def each(&)
      @routes.each(&)
    end

    private

    def collect_routes(routes)
      all_routes = []

      routes.each do |route|
        r = ActionDispatch::Routing::RouteWrapper.new(route)
        next if skip_route?(r)

        # The routes returned will have the name for the first instance of a
        # path and a blank string for all instances afterward.
        name = r.name.presence || route_name(all_routes, r)
        next unless name

        r.verb.split('|').each do |verb|
          next if verb == 'PUT'

          all_routes << { name:, path: r.path, verb: }
        end
      end

      all_routes
    end

    def skip_route?(route)
      route.internal? ||
        route.engine? ||
        route.path.starts_with?('/health_check') ||
        route.path.starts_with?('/rails')
    end

    def route_name(all_routes, route)
      all_routes.detect { |a| a[:path] == route.path }&.fetch(:name, '')
    end
  end

  # Get list of all requests done within specs in spec/request/*
  # Builds an enumerable collection in the format:
  #
  #   [
  #     { verb: POST, name: api_v1_session }
  #   ]
  #
  class RequestList
    include Enumerable

    # don't count commented out lines
    REGEXP = /^[^#]*((?:get|post|put|patch|delete)\s\w*_(path|url))/

    def initialize(req_specs)
      @requests = collect_requests(req_specs)
    end

    def each(&)
      @requests.each(&)
    end

    def covered?(verb, name)
      !!detect { |req| req[:verb] == verb && req[:name] == name }
    end

    private

    # scan spec file for integration requests
    def collect_requests(request_path)
      all_requests = []

      Dir[request_path].each do |spec_path|
        check_file(spec_path) { |match| all_requests << match }
      end

      all_requests.uniq.map do |r|
        verb, name = r.split
        {
          verb: verb.upcase.gsub('PUT', 'PATCH'),
          name: name.gsub(/(_path|_url)/, '')
        }
      end
    end

    def check_file(path)
      File.open(path).each do |line|
        line.scan(REGEXP).each do |match|
          yield match.first
        end
      end
    end
  end

  # Nicely print out the list of given routes
  #
  class RoutesPrinter
    def initialize(routes)
      @routes = routes
    end

    def print
      @routes.each do |r|
        puts "#{r[:verb].rjust(7)} #{r[:name].ljust(53)} "
      end
    end
  end
end
