## ECharts Autofit

> A React wrapper over ECharts.

Demo http://fe.jimu.io/echarts-autofit/

### Usage

![](https://img.shields.io/npm/v/@jimengio/echarts-autofit.svg?style=flat-square)

Notice, create a container element to define the width/height for the chart!

```jsx
import EChartsAutofit from "@jimengio/echarts-autofit";

<div className={styleArea}>
  <EChartsAutofit options={chartOptions} />
</div>;

let styleArea = css`
  margin-top: 100px;
  width: 80%;
  height: 400px;
  background-color: hsl(200, 70%, 50%, 0.1);
`;
```

SVG renderer:

```tsx
<EChartsAutofit className={height100Percent} options={this.getChartOption()} renderer="svg" />
```

Bind events:

```tsx
<EChartsAutofit options={this.options} events={{ click: this.onChartClick }} />
```

Do something when chart instance is ready:

```tsx
<EChartsAutofit options={this.getOptions()} onReady={this.onReady} />;

onReady = (chart: ECharts) => {
  this.chart = chart;
};
```

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
