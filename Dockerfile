FROM ruby:3.1.4

# install dependencies
RUN apt-get update -qq && apt-get install -y curl build-essential libpq-dev postgresql-client &&\
  curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y yarn && apt-get clean autoclean && \
  apt-get autoremove -y && \
  apt-get install -y libvips && \
  rm -rf /var/lib/apt /var/lib/dpkg /var/lib/cache /var/lib/log


# add rails executables to path
ENV PATH="/var/www/r8/bin:/usr/bin:${PATH}"

# setup env variables that will be available to the instance
ENV RAILS_ROOT /var/www/r8

# create dir for our app and set as the working dir
RUN gem install bundler:2.4.13
RUN mkdir -p $RAILS_ROOT
WORKDIR $RAILS_ROOT

# add gemfile and install gems
COPY Gemfile* $RAILS_ROOT/
RUN bundle install --jobs 20 --retry 5

# copy over app code
COPY . $RAILS_ROOT
# these next three lines could be consolidated
RUN yarn install && rake tmp:clear

COPY ./docker-entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/docker-entrypoint.sh

RUN bundle exec rake assets:precompile

# Rails
EXPOSE 3000

CMD ['rails', 'server', '-b', '0.0.0.0']
ENTRYPOINT ["docker-entrypoint.sh"]
