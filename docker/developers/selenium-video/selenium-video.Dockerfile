# This augments the selenium-video container to allow for remote start/stop of
# the video generation.

FROM selenium/video

USER 0

COPY selenium-video.supervisord.conf /etc/codeorg.supervisord.conf
RUN cat /etc/codeorg.supervisord.conf >> /etc/supervisord.conf
COPY --chown="${SEL_UID}:${SEL_GID}" selenium-video.control.py /opt/bin/control.py

# Turn off the automatic video.sh service
RUN cat /etc/supervisord.conf | sed -z 's/opt\/bin\/video.sh\nautostart=true/bin\/true\nautostart=false/g' > /etc/new.supervisord.conf
RUN cp /etc/new.supervisord.conf /etc/supervisord.conf

USER ${SEL_UID}

# Expose the control server port
EXPOSE 9001
