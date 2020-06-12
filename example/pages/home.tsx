import React, { FC } from "react";
import { css, cx } from "emotion";
import { genRouter } from "controller/generated-router";
import { HashLink } from "@jimengio/ruled-router/lib/dom";
import EChartAutofit from "../../src";
import { column, expand, row, Space } from "@jimengio/flex-styles";
import { JimoButton } from "@jimengio/jimo-basics";
import { useAtom } from "@jimengio/rex/lib/use-atom";

let PageHome: FC<{ className?: string }> = React.memo((props) => {
  let stateAtom = useAtom({ occupySpace: false, showDemo: true });

  /** Plugins */
  /** Methods */
  /** Effects */
  /** Renderers */

  let chartOptions = {
    title: {
      text: "世界人口总量",
      subtext: "数据来自网络",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["2011年", "2012年"],
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ["line", "bar"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    calculable: true,
    xAxis: [
      {
        type: "value",
        boundaryGap: [0, 0.01],
      },
    ],
    yAxis: [
      {
        type: "category",
        data: ["巴西", "印尼", "美国", "印度", "中国", "世界人口(万)"],
      },
    ],
    series: [
      {
        name: "2011年",
        type: "bar",
        data: [18203, 23489, 29034, 104970, 131744, 630230],
      },
      {
        name: "2012年",
        type: "bar",
        data: [19325, 23438, 31000, 121594, 134141, 681807],
      },
    ],
  };

  return (
    <div className={cx(column, styleContainer)}>
      <div className={styleTitle}>
        ECharts Autofit: Resize window to see how the demo fits the colored area...
        <JimoButton
          fillColor
          text="Toggle demo"
          onClick={() => {
            stateAtom.swapWith((state) => {
              state.showDemo = !state.showDemo;
            });
          }}
        />
        <Space width={8} />
        <JimoButton
          fillColor
          text="Toggle space"
          onClick={() => {
            stateAtom.swapWith((state) => {
              state.occupySpace = !state.occupySpace;
            });
          }}
        />
      </div>
      <div className={column}>{stateAtom.current.occupySpace ? <div style={{ height: 100 }}></div> : null}</div>
      {stateAtom.current.showDemo ? (
        <div className={cx(expand, row)}>
          <div className={cx(expand, styleArea)}>
            <EChartAutofit options={chartOptions} />
          </div>
          <EChartAutofit options={chartOptions} className={cx(expand, styleStandalone)} />
        </div>
      ) : null}
    </div>
  );
});

export default PageHome;

let styleArea = css`
  width: 800px;
  background-color: hsl(200, 70%, 50%, 0.1);
  border: 1px solid hsl(200, 80%, 50%);
`;

let styleContainer = css`
  border: 1px solid hsl(0, 80%, 80%);
  height: 800px;
`;

let styleStandalone = css`
  width: 800px;
`;

let styleTitle = css`
  padding: 8px;
`;
