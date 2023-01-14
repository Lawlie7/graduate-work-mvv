import React from 'react'
import './PlanDone.css'

import { Doughnut } from 'react-chartjs-2';

// Компонент, що створює блок діаграми «Виконання бюджету»
function PlanDone({data}) {
    const chartRef = React.useRef();
    
    // Змінна chartLabel містить масив з найменуваннями секторів діаграми, який спочатку пустий
    let [chartLabel, setChartLabel] = React.useState([]);
    
    // React.useEffect заповнить масив chartLabel необхіднимим даними та внесе зміни в DOM, після того, як буде побудована початкова діаграма за допомогою ChartJS
    // та посилання на неї буде збережено у змінній chartRef. Це необхідно, оскільки деякі частини початкової діаграми, яку створює ChartJS, будуть приховані 
    // та створені свої власні зі своїми стилями
    React.useEffect(() => {
        setChartLabel(["Виконано за період", "Залишилось до уточненого річного плану"])
    }, [chartRef])

    // Контен (html-структура), що відображає даний компонент на сторінці 
    return (
        <div className='plan-done'>
            <h2 className="plan-done__title">Виконання бюджету</h2>
            <div className="plan-done__body">
                <div className="plan-done__doughnut">
                    <div className='plan-done__done'>{data[0]['percentDoneToYearCorrectionPlan']} %</div>
                    {/* Компонент із бібліотеки ChartJS, у який передаються дані та налаштування необхідні для побудови діаграми «Виконання бюджету» */}
                    <Doughnut id='plan-done-id'
                        data={{
                            labels: chartLabel,
                            datasets: [
                                {
                                    data: [data[0]['periodDone'], (data[0]['yearCorrectionPlan'] - data[0]['periodDone'] > 0 ? data[0]['yearCorrectionPlan'] - data[0]['periodDone'] : 0)],
                                    backgroundColor: [
                                        '#13aa75',
                                        '#5a5a5a',
                                    ],
                                    borderWidth: 0,
                                    rotation: -90, 
                                    circumference: 180, // на скільки градусів розгорнута діаграма 
                                    cutout: "60%"
                                },
                            ],
                        }} 
                        options={{
                            responsive: true,
                            aspectRatio: 2, //вдвічі ширше за висоту. Оскільки ширина у нас задана, то висота буде вдвічі менша
                            plugins: {
                                legend: {
                                    display: false,
                                }
                            },
                        }}
                        ref={chartRef}
                    />
                    <div className="plan-done__progress plan-progress">
                        <p className="plan-progress__item">0 %</p>
                        <p className="plan-progress__item">100 %</p>
                    </div>
                </div>
                <div className="plan-done__legend plan-done-legend">
                    {chartLabel.length > 0 &&
                        <ul className="plan-done-legend__list">
                            <li title='Всього' className="plan-done-legend__item plan-done-legend__item_main">
                                <span className="plan-done-legend__color"></span> 
                                <p className="plan-done-legend__text">ВСЬОГО</p>
                                <span className="plan-done-legend__value">{(data[0]['yearCorrectionPlan']).toString().split("").reverse().join("").replace(/\d\d\d/g, "$& ").split("").reverse().join("")} грн</span>
                            </li>
                            <li className="plan-done-legend__item">
                                <span className="plan-done-legend__color" style={{backgroundColor: chartRef.current.data.datasets[0].backgroundColor[0]}}>
                                    {data[0]['percentDoneToYearCorrectionPlan'].toFixed(2)} %
                                </span> 
                                <p className="plan-done-legend__text">{chartLabel[0]}</p>
                                <span className="plan-done-legend__value">{data[0]['periodDone'].toString().split("").reverse().join("").replace(/\d\d\d/g, "$& ").split("").reverse().join("")} грн</span>
                            </li>
                            <li className="plan-done-legend__item">
                                <span className="plan-done-legend__color" style={{backgroundColor: chartRef.current.data.datasets[0].backgroundColor[1]}}>
                                    {(100 - data[0]['percentDoneToYearCorrectionPlan']).toFixed(2)} % 
                                </span> 
                                <p className="plan-done-legend__text">{chartLabel[1]}</p>
                                <span className="plan-done-legend__value">{(data[0]['yearCorrectionPlan'] - data[0]['periodDone']).toFixed(2).toString().split("").reverse().join("").replace(/\d\d\d/g, "$& ").split("").reverse().join("")} грн</span>
                            </li>
                        </ul>
                    }
                </div> 
            </div>       
        </div>
    )
}

export default PlanDone;