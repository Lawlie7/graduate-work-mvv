import React from 'react'
import './Infographics.css'

import { Bar } from 'react-chartjs-2';
import {Chart as ChartJS} from 'chart.js/auto';
import ChartTax from './ChartTax/ChartTax.jsx';
import PlanDone from './PlanDone/PlanDone.jsx';

// Компонент, у якому відображаються всі діаграми
function Infographics({data, renamedColumnNames, codes}) {
  const chartRef = React.useRef();
  // Контен (html-структура), що відображає даний компонент на сторінці
  return (
    <div className='infographics'>
      <PlanDone data={data} />
      <div className='infographics__bar'>
        <h2 className="infographics__bar-title">Виконання плану по видах надходжень</h2>
        <div className="infographics__bar-chart">
          {/* Компонент із бібліотеки ChartJS, у який передаються дані та налаштування необхідні для побудови діаграми «Виконання плану по видах надходжень» */}
          <Bar id='bar-chart' data={{
            labels: data.filter(obj => codes["0000000"]['codes'][obj['incomeCode']]).map(obj => obj['incomeCodeName']),
            datasets: [
                    {
                      label: "Річний план",
                      data: data.filter(obj => codes["0000000"]['codes'][obj['incomeCode']]).map( obj => obj['yearCorrectionPlan']),
                      backgroundColor: 'rgba(2, 71, 254, 0.7)',
                    },
                    {
                      label: renamedColumnNames['periodDone'],
                      data: data.filter(obj => codes["0000000"]['codes'][obj['incomeCode']]).map( obj => obj['periodDone']),
                      backgroundColor: 'rgba(250, 212, 0, 0.7)',
                    },
                ],
          }} 
          options = {
            {
              maintainAspectRatio: true,
              scales: {
                y: {
                  beginAtZero: true,
                  type: 'logarithmic',
                  ticks: {
                    autoSkip: true,
                    min: 0,
                    callback: function (value, index, values) {
                        if(values[index].major) {
                          switch (true) {
                            case value < 1000000:
                              return value / 1000 + ' тис'
                            case value < 1000000000:
                              return value / 1000000 + ' млн'
                            case value < 1000000000000:
                              return value / 1000000000 + ' млрд'
                            case value < 1000000000000000:
                              return value / 1000000000000 + ' трлн'
                            default:
                              return value;
                          }
                        } else {
                          return '';
                        }
                        
                    }
                },
                },
                x: {
                  ticks: {
                    autoSkip: false,
                    callback: (value, index, values) => {
                      let sections = [];
                      let words = data.filter(obj => codes["0000000"]['codes'][obj['incomeCode']]).map(obj => obj['incomeCodeName'])[value].split(" ");
                      let temp = "";
                      let width = chartRef.current?.width ? chartRef.current.width : window.outerWidth;
                      let maxWidth = width > 1500 ? 35 : (width > 1300 ? 30 : (width > 1100 ? 25 : 20));
                      words.forEach((item, index) => {
                        if(temp.length > 0) {
                          let concat = temp + ' ' + item;
                          
                          if(concat.length > maxWidth){
                            sections.push(temp);
                            temp = "";
                          }
                          else{
                            if(index == (words.length-1)) {
                              sections.push(concat);
                              return;
                            }
                            else {
                              temp = concat;
                              return;
                            }
                          }
                        }
                    
                        if(index == (words.length-1)) {
                          sections.push(item);
                          return;
                        }
                    
                        if(item.length < maxWidth) {
                          temp = item;
                        }
                        else {
                          sections.push(item);
                        }
                      });
                      return sections;
                    },
                    font: function(context) {
                      let width = context.chart.width;
                      let size = width > 1300 ? 14 : 12;
                      return {
                        size: size,
                      };
                    },
                },
                }
              },
              plugins: {
                legend: {
                  labels: {
                    font: function(context) {
                      let width = context.chart.width;
                      let size = width > 1300 ? 18 : (width > 1100 ? 16 : 14);
                      return {
                        size: size,
                      };
                    },
                  },
                },
              }
              
            }
          }
          ref={chartRef}/>
        </div>
      </div>
      <ChartTax data={data} renamedColumnNames={renamedColumnNames} codes={codes} />
    </div>
  )
}

export default Infographics;