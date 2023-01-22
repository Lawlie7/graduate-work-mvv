import React from 'react'
import { Bar } from 'react-chartjs-2';

import "./PlanDoneByTypes.css"

function PlanDoneByTypes({data, renamedColumnNames, codes}) {
    const chartRef = React.useRef();
    return (
        <div className='plan-done-by-type'>
            <h2 className="plan-done-by-type__title chart-title">Виконання плану по видах надходжень</h2>
            <div className="plan-done-by-type__chart">
                {/* Компонент із бібліотеки ChartJS, у який передаються дані та налаштування необхідні для побудови діаграми «Виконання плану по видах надходжень» */}
                <Bar id='plan-done-by-type-id' data={{
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
                                        
                                    },
                                    font: function(context) {
                                        let width = context.chart.width;
                                        let size = width > 1300 ? 14 : width / 85;
                                        return {
                                            size: size,
                                        };
                                    },
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
                                                    if(index === (words.length-1)) {
                                                        sections.push(concat);
                                                        return;
                                                    }
                                                    else {
                                                        temp = concat;
                                                        return;
                                                    }
                                                }
                                            }
                                        
                                            if(index === (words.length-1)) {
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
                                        let size = width > 1300 ? 14 : ( width > 992 ? 12 : width / 73.5);
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
                                        let size = width > 1300 ? 18 : (width > 1100 ? 16 : width / 60);
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
    )
}

export default PlanDoneByTypes