# frozen_string_literal: true

require 'sidekiq'
require 'sidekiq/web'

Sidekiq.configure_client do |config|
  config.redis = {
    url: (ENV['REDIS_URL'] || 'redis://127.0.0.1:6379'),
    ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
  }
end

Sidekiq.configure_server do |config|
  config.redis = {
    url: (ENV['REDIS_URL'] || 'redis://127.0.0.1:6379'),
    ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE }
  }
end

Sidekiq::Web.use(Rack::Auth::Basic) do |user, password|
  # Protect against timing attacks:
  # - See https://codahale.com/a-lesson-in-timing-attacks/
  # - See https://thisdata.com/blog/timing-attacks-against-string-comparison/
  # - Use & (do not use &&) so that it doesn't short circuit.
  # - Use digests to stop length information leaking
  Rack::Utils.secure_compare(Digest::SHA256.hexdigest(user), Digest::SHA256.hexdigest(ENV.fetch('SIDEKIQ_USER', nil))) &
    Rack::Utils.secure_compare(Digest::SHA256.hexdigest(password),
                               Digest::SHA256.hexdigest(ENV.fetch('SIDEKIQ_PASSWORD', nil)))
end
