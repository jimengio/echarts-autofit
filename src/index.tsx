import React, { CSSProperties, ReactNode } from "react";
import _ from "lodash";
import { css, cx } from "emotion";
import { ECharts } from "echarts";
import isEqual from "lodash/isEqual";

/** 取整... */
export function fixed(value: any, decimals = 3) {
  let valueParsed: number;

  if (typeof value !== "number") {
    valueParsed = parseFloat(value);
  } else {
    valueParsed = value;
  }

  if (!isNaN(valueParsed)) {
    return +valueParsed.toFixed(decimals);
  }

  return valueParsed;
}

export enum EChartZoomDirection {
  Both = 1,
  Start = 2,
  End = 3,
  None = 4,
}

interface CustomizeChartEvent {
  datazoommouseup?: (direction: EChartZoomDirection, isMove: boolean, data) => void;
  resize?: () => void;
}

interface ChartEvents extends CustomizeChartEvent {
  click?: (event) => void;
  dblclick?: (event) => void;
  mousedown?: (event) => void;
  mousemove?: (event) => void;
  mouseup?: (event) => void;
  mouseover?: (event) => void;
  mouseout?: (event) => void;
  datazoom?: (data) => void;
}

interface IProps {
  className?: string;
  style?: CSSProperties;
  onReady?: (chart) => void;
  renderer?: "canvas" | "svg";
  resizeDisabled?: boolean;
  forceClear?: boolean;
  options: any;
  notMergeOption?: boolean;
  events?: ChartEvents;

  menuRenderer?: () => ReactNode;
}

export default class EChartAutofit extends React.Component<IProps, any> {
  _chartElement: any;
  _chart: ECharts;
  _latestZoomLeft: number;
  _latestZoomRight: number;
  _isZooming: boolean;

  debouncedOnWindowResize: any;

  constructor(props) {
    super(props);

    this.debouncedOnWindowResize = _.debounce(this.onWindowResize, 200);
  }

  render() {
    const { className, style } = this.props;
    return (
      <div className={cx(styleContainer, className)} style={style}>
        <div className={cx(styleContainer)} ref={(e) => (this._chartElement = e)} />
        {_.isFunction(this.props.menuRenderer) ? this.props.menuRenderer() : null}
      </div>
    );
  }

  async componentDidMount() {
    let echarts = (await import(/* webpackChunkName: "echarts" */ "echarts")).default;

    this._chart = echarts.init(this._chartElement, null, { renderer: this.props.renderer });
    this._chart.setOption(this.props.options, this.props.notMergeOption);

    // better solution is using element-resize-event, not doing that for now
    // https://github.com/hustcc/echarts-for-react/blob/44c1e27e105236b72aff1bd2a3cc62a83fe3c75d/src/core.jsx#L82

    if (!this.props.resizeDisabled) {
      window.addEventListener("resize", this.debouncedOnWindowResize);
    }

    // NOTICE: this is over-simplified compared with echarts-for-react, need updates probably.
    this.bindEvents(this.props.events);

    this.setZoomCache();
    this.bindDataZoomEvent();

    if (this.props.onReady != null) {
      this.props.onReady(this._chart);
    }
  }

  async componentWillUnmount() {
    let echarts = (await import(/* webpackChunkName: "echarts" */ "echarts")).default;

    if (!this.props.resizeDisabled) {
      window.removeEventListener("resize", this.debouncedOnWindowResize);
      this.debouncedOnWindowResize.cancel();
    }

    this.unbindDataZoomEvent();

    this._chartElement && echarts.dispose(this._chartElement);
  }

  componentDidUpdate(prevProps: IProps, prevState: any) {
    const isOptionEqual = isEqual(prevProps.options, this.props.options);

    if (!isOptionEqual) {
      if (this.props.forceClear) {
        this._chart.clear();
        console.debug("JMEChart clear");
      }

      // console.log("JMEChart update");

      this._chart.setOption(this.props.options, this.props.notMergeOption);
      this.setZoomCache();
    }

    if (!isEqual(prevProps.events, this.props.events)) {
      this.unbindEvents(prevProps.events);
      this.bindEvents(this.props.events);
    }
  }

  getZoomOption() {
    const option: any = this._chart.getOption();
    const dataZoom = option.dataZoom;

    if (dataZoom && dataZoom.length) {
      return dataZoom[0];
    }

    return null;
  }

  setZoomCache() {
    const dataZoom = this.getZoomOption();

    // TODO: 目前只实现了横轴且单轴的情况，如果需要多轴，需要把缓存变量变成数组，分别记录判断。
    if (dataZoom) {
      this._latestZoomLeft = dataZoom.start;
      this._latestZoomRight = dataZoom.end;
    } else {
      this._latestZoomLeft = undefined;
      this._latestZoomRight = undefined;
    }
  }

  bindDataZoomEvent() {
    this._chart.getDom().addEventListener("mouseup", this.onZoomMouseUp);
    this._chart.on("datazoom", this.onZoom);
  }

  unbindDataZoomEvent() {
    this._chart.getDom().removeEventListener("mouseup", this.onZoomMouseUp);
    this._chart.off("datazoom", this.onZoom);
  }

  bindEvents(events: ChartEvents) {
    if (events != null) {
      for (let eventName in events) {
        if (eventName !== "datazoommouseup") {
          this._chart.on(eventName, events[eventName]);
        }
      }
    }
  }

  unbindEvents(events: ChartEvents) {
    if (events != null) {
      for (let eventName in events) {
        this._chart.off(eventName);
      }
    }
  }

  onWindowResize = () => {
    this._chart && this._chart.resize();

    const { events } = this.props;

    if (events && events.resize) {
      events.resize();
    }
  };

  onZoomMouseUp = () => {
    if (this._isZooming) {
      const events = this.props.events;

      if (events) {
        if (events.datazoommouseup) {
          let zoomDirection;
          const dataZoom = this.getZoomOption();
          const isMove = fixed(dataZoom.end - this._latestZoomRight) === fixed(dataZoom.start - this._latestZoomLeft);

          if (dataZoom.start !== this._latestZoomLeft && dataZoom.end !== this._latestZoomRight) {
            zoomDirection = EChartZoomDirection.Both;
          } else if (dataZoom.start !== this._latestZoomLeft) {
            zoomDirection = EChartZoomDirection.Start;
          } else if (dataZoom.end !== this._latestZoomRight) {
            zoomDirection = EChartZoomDirection.End;
          } else {
            zoomDirection = EChartZoomDirection.None;
          }

          events.datazoommouseup(zoomDirection, isMove, dataZoom);
          this.setZoomCache();
          this._isZooming = false;
        }
      }
    }
  };

  onZoom = (data) => {
    if (!this._isZooming) this._isZooming = true;
  };
}

const styleContainer = css`
  width: 100%;
  height: 100%;
`;
