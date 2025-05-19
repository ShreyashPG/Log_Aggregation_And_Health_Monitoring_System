FROM fluent/fluentd:v1.14-1
USER root
RUN gem install fluent-plugin-mongo
COPY fluent.conf /fluentd/etc/fluent.conf
USER fluent