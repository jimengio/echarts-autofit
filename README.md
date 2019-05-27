## ECharts Autofit

> A React wrapper over ECharts.

Demo http://fe.jimu.io/echarts-autofit/

### Usage

![](https://img.shields.io/npm/v/@jimengio/echarts-autofit.svg?style=flat-square)

Notice, create a container element to define the width/height for the chart!

```jsx
import EChartAutofit from "@jimengio/echarts-autofit";

<div className={styleArea}>
  <EChartAutofit options={chartOptions} />
</div>;

let styleArea = css`
  margin-top: 100px;
  width: 80%;
  height: 400px;
  background-color: hsl(200, 70%, 50%, 0.1);
`;
```

### Workflow

https://github.com/jimengio/ts-workflow

### License

MIT
