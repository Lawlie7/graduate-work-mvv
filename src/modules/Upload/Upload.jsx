import React from 'react';
import axios from 'axios';

import './Upload.css';

// Масив із назвами місяців року
const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень',  'Червень',  'Липень',  'Серпень',  'Вересень',  'Жовтень',  'Листопад',  'Грудень',];
const budgetTypes = [{id: "NATIONAL", name: "Державний"}, {id: "LOCAL", name: "Місцевий"}]
const regions = [
    {
        "budgetCode": "0000000000",
        "budgetName": "Загальний місцевий бюджет",
    },
    {
        "budgetCode": "26000000000",
        "budgetName": "місто Києв",
    },
    {
        "budgetCode": "01000000000",
        "budgetName": "Автономна Республіка Крим",
    },
    {
        "budgetCode": "02000000000",
        "budgetName": "Вінницька область",
    },
    {
        "budgetCode": "03000000000",
        "budgetName": "Волинська область",
    },
    {
        "budgetCode": "04000000000",
        "budgetName": "Дніпропетровська область",
    },
    {
        "budgetCode": "05000000000",
        "budgetName": "Донецька область",
    },
    {
        "budgetCode": "06000000000",
        "budgetName": "Житомирська область",
    },
    {
        "budgetCode": "07000000000",
        "budgetName": "Закарпатська область",
    },
    {
        "budgetCode": "08000000000",
        "budgetName": "Запорізька область",
    },
    {
        "budgetCode": "09000000000",
        "budgetName": "Івано-Франківська область",
    },
    {
        "budgetCode": "10000000000",
        "budgetName": "Київська область",
    },
    {
        "budgetCode": "11000000000",
        "budgetName": "Кіровоградська область",
    },
    {
        "budgetCode": "12000000000",
        "budgetName": "Луганська область",
    },
    {
        "budgetCode": "13000000000",
        "budgetName": "Львівська область",
    },
    {
        "budgetCode": "14000000000",
        "budgetName": "Миколаівська область",
    },
    {
        "budgetCode": "15000000000",
        "budgetName": "Одеська область",
    }, 
    {
        "budgetCode": "16000000000",
        "budgetName": "Полтавська область",
    }, 
    {
        "budgetCode": "17000000000",
        "budgetName": "Рівненська область",
    }, 
    {
        "budgetCode": "18000000000",
        "budgetName": "Сумська область",
    },
    {
        "budgetCode": "1900000000",
        "budgetName": "Тернопільська область",
    },
    {
        "budgetCode": "2000000000",
        "budgetName": "Харківська область",
    },
    {
        "budgetCode": "21000000000",
        "budgetName": "Херсонська область",
    },
    {
        "budgetCode": "22000000000",
        "budgetName": "Хмельницька область",
    },
    {
        "budgetCode": "23000000000",
        "budgetName": "Черкаська область",
    },
    {
        "budgetCode": "24000000000",
        "budgetName": "Чернівецька область",
    },
    {
        "budgetCode": "25000000000",
        "budgetName": "Чернігівська область",
    },
]

// Компонент, для вибору періоду та отримання за цей період даних
function Upload({setData, setIsLoading, startDate, allDataParams, selectedDataParam, setSelectedDataParam}) {
    function onSelectDate(e) {
        switch (e.target.name) {
            case 'year':
                setSelectedDataParam(prev => ({...prev, year: +e.target.value, fromMonth: 1, toMonth: startDate.year === +e.target.value ? startDate.toMonth : 12}))
                break;
            case 'fromMonth':
                setSelectedDataParam(prev => ({...prev, fromMonth: +e.target.value, toMonth: +e.target.value < selectedDataParam.toMonth ? selectedDataParam.toMonth : +e.target.value}))
                break;
            case 'toMonth':
                setSelectedDataParam(prev => ({...prev, toMonth: +e.target.value < selectedDataParam.fromMonth ? selectedDataParam.fromMonth : +e.target.value}))
                break;
            case 'budgetType':
                if(e.target.value === "NATIONAL") {
                    setSelectedDataParam(prev => ({...prev, budgetType: e.target.value, budgetCode: "0000000000"}))
                } else {
                    setSelectedDataParam(prev => ({...prev, budgetType: e.target.value}))
                }
                break;
            case 'region':
                setSelectedDataParam(prev => ({...prev, budgetCode: e.target.value}))
                break;
        }
    }
    function getData(e) {
        setIsLoading(false);
        if(e) e.preventDefault();
        if(selectedDataParam.budgetType === "LOCAL" && selectedDataParam.budgetCode !== "0000000000") {
            axios.get(`https://openbudget.gov.ua/api/localBudgets/incomesLocal/JSON?year=${selectedDataParam.year}&periodTo=${selectedDataParam.toMonth}&periodType=MONTH&codeBudget=${selectedDataParam.budgetCode}&periodFrom=${selectedDataParam.fromMonth}&fundType=TOTAL`)
            .then(request => {
                setData(request.data.map(obj => {
                    let newObj = {}
                    Object.entries(obj).forEach(([key, value]) => {
                        switch (key) {
                            case 'totalDone':
                                newObj["periodDone"] = value;
                                break;
                            case 'yearBudgetPlan':
                                newObj["yearCorrectionPlan"] = value;
                                break;
                            case 'percentDone':
                                newObj["percentDoneToYearCorrectionPlan"] = value;
                                break;
                            default:
                                newObj[key] = value;
                                break;
                        }
                    })
                    return newObj;
                }));
                setIsLoading(true);
            })
            .catch(error => console.log(error));
        } else {
            axios.get(`https://openbudget.gov.ua/api/reports/income/details/JSON?budgetType=${selectedDataParam.budgetType}&fundType=TOTAL&year=${selectedDataParam.year}&monthTo=${selectedDataParam.toMonth}&monthFrom=${selectedDataParam.fromMonth}`)
            .then(request => {
                setData(request.data);
                setIsLoading(true);
            })
            .catch(error => console.log(error));
        }
    }

    return (
        <form className={`upload ${selectedDataParam.budgetType === "LOCAL" ? "upload_big" : ""}`} onSubmit={getData}>
            <div className="upload__item">
                <p className="upload__text">Рік:</p>
                <select className="upload__select" name="year" onChange={onSelectDate} value={selectedDataParam.year}>
                    { allDataParams.years.length > 0 &&
                        allDataParams.years.map(year => <option className="upload__value" value={year} key={year}>{year}</option>)
                    }
                </select>
            </div>
            <div className="upload__item">
                <p className="upload__text">Період:</p>
                <div className="upload__item-group">
                    <select className="upload__select" name="fromMonth" onChange={onSelectDate} value={selectedDataParam.fromMonth}>
                        { allDataParams.fromMonth.length > 0 &&
                            allDataParams.fromMonth.map(month => <option className="upload__value" value={month} key={month}>{monthNames[month-1]}</option>)
                        }
                    </select> 
                    — 
                    <select className="upload__select" name="toMonth" onChange={onSelectDate} value={selectedDataParam.toMonth}>
                        { allDataParams.toMonth.length > 0 &&
                            allDataParams.toMonth.map(month => <option className="upload__value" value={month} key={month}>{monthNames[month-1]}</option>)
                        }
                    </select>
                </div>
            </div>
            <div className="upload__item">
                <p className="upload__text">Вид бюджету:</p>
                <select className="upload__select" name="budgetType" onChange={onSelectDate} value={selectedDataParam.budgetType}>
                    { budgetTypes.length > 0 &&
                        budgetTypes.map(budgetType => <option className="upload__value" value={budgetType.id} key={budgetType.id}>{budgetType.name}</option>)
                    }
                </select>
            </div>
            {selectedDataParam.budgetType === "LOCAL" &&
                <div className="upload__item">
                    <p className="upload__text">Область:</p>
                    <select className="upload__select" name="region" onChange={onSelectDate} value={selectedDataParam.budgetCode}>
                        { regions.length > 0 &&
                            regions.map(region => <option className="upload__value" value={region.budgetCode}>{region.budgetName}</option>)
                        }
                    </select>
                </div> 
            }      
                      
            <button className="upload__button">Отримати дані</button>
        </form>
    )
}

export default Upload