import React from 'react';
import axios from 'axios';

import './Upload.css';

// Масив із назвами місяців року
const monthNames = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень',  'Червень',  'Липень',  'Серпень',  'Вересень',  'Жовтень',  'Листопад',  'Грудень',];

// Компонент, для вибору періоду та отримання за цей період даних
function Upload({setData, setIsLoading}) {
    const [tempStartDate, setTempStartDate] = React.useState({ year: null, fromMonth: null, toMonth: null })
    const [startDate, setStartDate] = React.useState({})
    const [selectedDate, setSelectedDate] = React.useState({});
    const [allDates, setAllDates] = React.useState({years: [], fromMonth: [], toMonth: [],});
    
    React.useEffect(() => {
        const today = new Date();
        setTempStartDate({  
            year: today.getFullYear(),
            fromMonth: 1,
            toMonth: today.getMonth() + 1,
        })
    }, [])
    React.useEffect(() => {
        axios.get(`https://openbudget.gov.ua/api/reports/income/details/JSON?budgetType=NATIONAL&fundType=TOTAL&year=${tempStartDate.year}&monthTo=${tempStartDate.toMonth}&monthFrom=${tempStartDate.fromMonth}`)
        .then(request => {
           if(request.data.length <= 1) {
                setTempStartDate( prev => {
                    return {
                        year: prev.toMonth > 1 ? prev.year : prev.year - 1,
                        fromMonth: 1,
                        toMonth: prev.toMonth > 1 ? prev.toMonth - 1 : 12,
                    }
                })
            } else {
                setStartDate(tempStartDate);
                setSelectedDate(tempStartDate);
                setData(request.data);
                setIsLoading(true);
            }
        })
    }, [tempStartDate])
    React.useEffect(() => {
        let tempAllDates = {years: [], fromMonth: [], toMonth: [],};
        for (let i = 2018; i <= startDate.year; i++) {
            tempAllDates.years.push(i);    
        }

        for (let i = 1; i <= selectedDate.toMonth; i++) {
            tempAllDates.fromMonth.push(i); 
        }
        
        let toMonth = selectedDate.year < startDate.year ? 12 : startDate.toMonth;
        for (let i = selectedDate.fromMonth; i <= toMonth; i++) {
            tempAllDates.toMonth.push(i); 
        }

        setAllDates(tempAllDates);
    }, [selectedDate])

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
            Рік:
            <select className="upload__select" name="year" onChange={onSelectDate} value={selectedDate.year}>
            { allDates.years.length > 0 &&
                allDates.years.map(year => <option className="upload__value" value={year} key={year}>{year}</option>)
            }
            </select>
            Період: 
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
            <button className="upload__button">Отримати дані</button>
        </form>
    )
}

export default Upload