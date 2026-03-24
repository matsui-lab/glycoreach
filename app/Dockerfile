FROM rocker/shiny:4.4.1

RUN install2.r --error --skipinstalled \
    data.table \
    plotly \
    DT \
    ggplot2 \
    heatmaply \
    bslib \
    R.utils

RUN rm -rf /srv/shiny-server/*

COPY . /srv/shiny-server/

RUN chown -R shiny:shiny /srv/shiny-server

EXPOSE 3838

USER shiny

CMD ["R", "-e", "shiny::runApp('/srv/shiny-server', host='0.0.0.0', port=3838)"]
