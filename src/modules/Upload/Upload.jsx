import React from 'react';
import axios from 'axios';

import './Upload.css';

// Масив із назвами місяців року
const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень',  'Червень',  'Липень',  'Серпень',  'Вересень',  'Жовтень',  'Листопад',  'Грудень',];

// Компонент, для вибору періоду та отримання за цей період даних
function Upload({setData, setIsLoading, startDate, allDates, selectedDate, setSelectedDate}) {
    function onSelectDate(e) {
        switch (e.target.name) {
            case 'year':
                setSelectedDate({year: +e.target.value, fromMonth: 1, toMonth: startDate.year === +e.target.value ? startDate.toMonth : 12})
                break;
            case 'fromMonth':
                setSelectedDate(prev => {return {...prev, 
                fromMonth: +e.target.value, 
                toMonth: +e.target.value < selectedDate.toMonth ? selectedDate.toMonth : +e.target.value}})
                break;
            case 'toMonth':
                setSelectedDate(prev => {return {...prev, 
                toMonth: +e.target.value < selectedDate.fromMonth ? selectedDate.fromMonth : +e.target.value}})
                break;
        }
    }
    function getData(e) {
        setIsLoading(false);
        if(e) e.preventDefault();
        axios.get(`https://openbudget.gov.ua/api/reports/income/details/JSON?budgetType=NATIONAL&fundType=TOTAL&year=${selectedDate.year}&monthTo=${selectedDate.toMonth}&monthFrom=${selectedDate.fromMonth}`)
            .then(request => {
                setData(request.data);
                setIsLoading(true);
            })
            .catch(error => console.log(error));
    }

    return (
        <form className="upload" onSubmit={getData}>
            <div className="upload__item">
                Рік:
                <select className="upload__select" name="year" onChange={onSelectDate} value={selectedDate.year}>
                    { allDates.years.length > 0 &&
                        allDates.years.map(year => <option className="upload__value" value={year} key={year}>{year}</option>)
                    }
                </select>
            </div>
            <div className="upload__item">
                Період:
                <div className="upload__item-group">
                    <select className="upload__select" name="fromMonth" onChange={onSelectDate} value={selectedDate.fromMonth}>
                        { allDates.fromMonth.length > 0 &&
                            allDates.fromMonth.map(month => <option className="upload__value" value={month} key={month}>{monthNames[month-1]}</option>)
                        }
                    </select> 
                    — 
                    <select className="upload__select" name="toMonth" onChange={onSelectDate} value={selectedDate.toMonth}>
                        { allDates.toMonth.length > 0 &&
                            allDates.toMonth.map(month => <option className="upload__value" value={month} key={month}>{monthNames[month-1]}</option>)
                        }
                    </select>
                </div>
            </div>            
            <button className="upload__button">Отримати дані</button>
        </form>
    )
}

export default Upload