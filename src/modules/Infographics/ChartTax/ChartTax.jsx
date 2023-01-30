import React from "react";
import {Doughnut, getElementAtEvent} from 'react-chartjs-2';

import "./ChartTax.css";

// Компонент, що створює блок діаграми «Структура бюджету»
function ChartTax({data, renamedColumnNames, codes}) {
  const chartRef = React.useRef(); // Збеігає посилання на діаграму
  let [breadcrumbs, setBreadcrumbs] = React.useState([]); // Містити у собі послідовну інформацію про рівні, по яких відбувався перехід взаємодіючи із діаграмою
  let [currentCodesTree, setCurrentСodesTree] = React.useState({}); // Містить дані про поточну гілку (рівень) «дерева» податкових надходжень
  let [chartLabel, setChartLabel] = React.useState([]); // Містить опис (найменування) секцій діаграми
  let [chartLabelSort, setChartLabelSort] = React.useState([]); // Має ті ж дані, що у chartLabel, але у відсортованому вигляді за сумою надходжень у порядку спадання
  let [chartDataSort, setChartDataSort] = React.useState([]); // Відсортований масив числових даних (сума податкових надходжень за кожен вид надходжень на поточному рівні) на основі якого буде побудована діаграма
  let [chartCodesSort, setChartCodesSort] = React.useState([]); // Містить відсортовані коди за сумою надходжень по ним у порядку спадання
  let [chartLegend, setChartLegend] = React.useState([]); // Дані для побудови власної легенди діаграми. Легенда розшифровує назви рядків даних за якими було побудовано діаграму (розшифровує назви секторів)

  const printElementAtEvent = (element) => {
    if (!element.length) return;

    const { index } = element[0];

    if(currentCodesTree['codes'][chartCodesSort[index]]['periodDone'] > 0 && currentCodesTree['codes'][chartCodesSort[index]]['codes']) {
      setCurrentСodesTree(currentCodesTree['codes'][chartCodesSort[index]]);
      setBreadcrumbs(prev => [...prev, {currentCodesTree: currentCodesTree, chartLabel: chartLabelSort[index]}])
    } 
  };

  // React.useEffect виконає передану функцію і встановить необхідні для роботи діаграми дані у необхідні змінні та внесе зміни в DOM, 
  // після того як будуть змінені дані у змінній codes
  React.useEffect(() => { 
    setCurrentСodesTree(codes["0000000"]);
    setBreadcrumbs([{currentCodesTree: codes["0000000"], chartLabel: 'Доходи'}])
    
    setChartLabel(data.filter(obj => Object.keys(codes["0000000"]['codes']).includes(obj['incomeCode'])).map(obj => obj['incomeCodeName']))
    let temp = data.filter(obj => Object.keys(codes["0000000"]['codes']).includes(obj['incomeCode']))
    temp.sort((a, b) => b['periodDone'] - a['periodDone']);

    setChartLabelSort(temp.map(obj => obj['incomeCodeName']));
    setChartDataSort(temp.map(obj => obj['periodDone'] > 0 ? obj['periodDone'] : 0));
    setChartCodesSort(temp.map(obj => obj['incomeCode']));

    if(chartRef.current) chartRef.current.update();
  }, [codes])
 
  // React.useEffect виконає передану функцію і встановить необхідні для роботи діаграми дані у необхідні змінні та внесе зміни в DOM, 
  // після того як будуть змінені дані у змінній currentCodesTree
  React.useEffect(() => {
    if(currentCodesTree['codes']) {
      setChartLabel(data.filter(obj => Object.keys(currentCodesTree['codes']).includes(obj['incomeCode'])).map(obj => obj['incomeCodeName']))

      let temp = data.filter(obj => Object.keys(currentCodesTree['codes']).includes(obj['incomeCode']));
      temp.sort((a, b) => b['periodDone'] - a['periodDone']);
      
      setChartLabelSort(temp.map(obj => obj['incomeCodeName']));
      setChartDataSort(temp.map(obj => obj['periodDone'] > 0 ? obj['periodDone'] : 0));
      setChartCodesSort(temp.map(obj => obj['incomeCode']));
      
      if(chartRef.current) chartRef.current.update();
    }
  }, [currentCodesTree])

  // React.useEffect виконає передану функцію і встановить необхідні для роботи діаграми дані у необхідні змінні та внесе зміни в DOM, 
  // після того як будуть змінені дані у змінній chartLabel
  React.useEffect(() => {
    let chart = chartRef.current;
    if (chart) {
      if (chart.canvas.id === "chart-tax-id") {
        chartLabel.forEach((el, index) => {
          if(!chartRef.current.getDataVisibility(index)){
            chartRef.current.toggleDataVisibility(index)
          }
        })
        setChartLegend(chartLabel)
      }
      chart.update();
    } 
  }, [chartLabel]);
  
  // Отримати індекс сектора, якому відповідає натиснутий елемент списку в "легенді діаграми"
  function getIndex (label) {
    return chartLabelSort.indexOf(label)
  }

  let hoverChartItenIndex; // Зберігає індекс сектора діаграми, на який наведено курсор миші

  // Контен (html-структура), який відображається даним компонентом на сторінці
  return (
    <div className="chart-tax">
      <h2 className="chart-tax__title chart-title">Структура бюджету</h2>
      <div className="chart-tax__header chart-tax-header ">
        {breadcrumbs.length > 0 &&
          <p className="chart-tax-header__title doughnut-codes-header__title">
            {breadcrumbs[breadcrumbs.length - 1].chartLabel}
          </p>
        }
        {breadcrumbs.length > 1 &&
        <div className="chart-tax-header__breadcrumbs breadcrumb">
          {breadcrumbs.map((item, index) => <div className='breadcrumb__item' style={{'--i': index}} onClick={() => {setCurrentСodesTree(breadcrumbs[index+1].currentCodesTree); setBreadcrumbs(prev => prev.filter((el, i) => i <= index))}} key={`breadcrumb_${item.chartLabel}_${index}`}>{item.chartLabel}</div>)}
        </div>
        }
      </div>
      <div className="chart-tax__body">
        <div className="chart-tax__doughnut">
          {/* Компонент із бібліотеки ChartJS, у який передаються дані та налаштування необхідні для побудови діаграми «Структура бюджету» */}
          <Doughnut id='chart-tax-id' 
            data={{
              labels: chartLabelSort,
              datasets: [
                {
                  label: renamedColumnNames['periodDone'],
                  data: chartDataSort,
                  backgroundColor: ['#0247fe', '#fad400', '#fe2712', '#55308d', '#ff5d00', '#80d41a', '#800080', '#ff8001', '#00a934', '#c4037d', '#ffc00b', '#158466', '#0F4BA5', '#A36600', '#BD0084', '#AEED00', '#3E91D0', '#FD9F3F', '#D134D1', '#719A00', '#160771', '#BB9E2F', '#9A0018', '#3AD600',  "#7E70D6", "#BBB72F", "#F66F84", "#8CEA69", "#A35200"],
                  borderColor: ['#FFFFFF'],
                  borderWidth: 1,
                },
              ],
              chartCodes: chartCodesSort,
            }}
            options={{
              onHover: function (evt, item, chart) {
                // Зміна кольору сектору діаграми на який наведено курсор миші
                if (item && item.length) {
                  if(hoverChartItenIndex !== item[0].index) {
                    hoverChartItenIndex = item[0].index;
                    chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
                      if (index === hoverChartItenIndex ) {
                        if (color.length === 9) colors[index] = color.slice(0, -2)
                      } else {
                        colors[index] = color.length === 9 ? color : color + '4D';
                      }
                    });
                  }
                  chartRef.current.update();
                } else {
                  if (item) {
                    hoverChartItenIndex = null;
                    chart.data.datasets[0].backgroundColor.forEach((color, index, colors) => {
                      colors[index] = color.length === 9 ? color.slice(0, -2) : color;
                    });
                    chartRef.current.update();
                  }
                }
              },
              plugins: {
                legend: {
                  display: false,
                }
              },
              animation: {
                backgroundColors: true
              }
            }}
            ref={chartRef}
            onClick={(event) => printElementAtEvent(getElementAtEvent(chartRef.current, event))}
          />
        </div>
        <div className="chart-tax__legend-wrapper">
          <div className="chart-tax__legend chart-tax-legend">
            {chartLegend.length > 0 &&
              <ul className="chart-tax-legend__list">
                <li title='Всього' className="chart-tax-legend__item chart-tax-legend__item_main">
                  <span className="chart-tax-legend__color"></span> 
                  <p className="chart-tax-legend__text">ВСЬОГО</p>
                  <span className="chart-tax-legend__value">{(currentCodesTree['periodDone']).toString().split("").reverse().join("").replace(/\d\d\d/g, "$& ").split("").reverse().join("")} грн</span>
                </li>
                {
                  chartLegend.filter((label, index) => currentCodesTree['codes'][chartCodesSort[getIndex(label)]] && currentCodesTree['codes'][chartCodesSort[getIndex(label)]]['periodDone'] !== 0).map((label, index) => {
                    let indexSort = getIndex(label)
                    let sum = 0;
                    let dataArr = chartRef.current.data.datasets[0].data;
                    dataArr.forEach(data => {
                      sum += data;
                    });

                    let percentage = (chartRef.current.data.datasets[0].data[indexSort] * 100 / sum).toFixed(2)+" %";

                    return <li title={label} className="chart-tax-legend__item" key={`chart-tax-legend_${label}_${index}`}
                      onClick={(event) => {
                        if (event.ctrlKey && chartRef.current) {
                          chartRef.current.toggleDataVisibility(indexSort);
                          event.target.closest(".chart-tax-legend__item").classList.toggle("_crossed-out");
                          chartRef.current.update(); 
                        } else if(currentCodesTree['codes'][chartCodesSort[indexSort]]['periodDone'] > 0 && currentCodesTree['codes'][chartCodesSort[indexSort]]['codes']) {
                          document.querySelectorAll(".chart-tax-legend__item").forEach(li => li.classList.remove("_crossed-out"))
                          setCurrentСodesTree(currentCodesTree['codes'][chartCodesSort[indexSort]]);
                          setBreadcrumbs(prev => [...prev, {currentCodesTree: currentCodesTree, chartLabel: chartLabelSort[indexSort]}])
                        }
                      }}
                      onMouseEnter ={() => {
                        chartRef.current.data.datasets[0].backgroundColor.forEach((color, dataIndex, colors) => {
                          colors[dataIndex] = dataIndex === indexSort || color.length === 9 ? color : color + '4d';
                        });
                        chartRef.current.update();
                      }}
                      onMouseLeave ={() => {
                        chartRef.current.data.datasets[0].backgroundColor.forEach((color, dataIndex, colors) => {
                          colors[dataIndex] = color.length === 9 ? color.slice(0, -2) : color;
                        });
                        chartRef.current.update();
                      }}
                    >
                      <span className="chart-tax-legend__color" style={{backgroundColor:  chartRef.current.data.datasets[0].backgroundColor[indexSort] && chartRef.current.data.datasets[0].backgroundColor[indexSort].length === 9 ? chartRef.current.data.datasets[0].backgroundColor[indexSort].slice(0, -2) : chartRef.current.data.datasets[0].backgroundColor[indexSort]}}>
                        { percentage }
                      </span> 
                      <p className="chart-tax-legend__text">{label}</p>
                      <span className="chart-tax-legend__value">{(currentCodesTree['codes'][chartCodesSort[indexSort]]['periodDone']).toString().split("").reverse().join("").replace(/\d\d\d/g, "$& ").split("").reverse().join("")} грн</span>
                    </li>
                  })
                }
              </ul>
            }
          </div> 
        </div>
      </div>
    </div>
  );
};

export default ChartTax;