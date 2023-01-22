import React from 'react';
import axios from 'axios';
import './App.css';

import loading from './images/loading.gif'

import {Chart as ChartJS} from 'chart.js/auto';
import MainPage from './pages/MainPage/MainPage.jsx';
import DataPage from './pages/DataPage/DataPage.jsx';
import { NavLink, Route, Routes } from 'react-router-dom';
import InfographicPage from './pages/InfographicPage/InfographicPage';
import PlanDone from './modules/Infographics/PlanDone/PlanDone';
import PlanDoneByTypes from './modules/Infographics/PlanDoneByTypes/PlanDoneByTypes';
import ChartTax from './modules/Infographics/ChartTax/ChartTax';

// Найменування полів даних, що надходять у json форматі після відправки запиту, кирилицею
const renamedColumnNames = {
  "fundType": "Тип фонду",
  "incomeCode": "Код",
  "incomeCodeName": "Найменування коду",
  "yearBeginPlan": "Початковий річний план",
  "yearCorrectionPlan": "Уточнений річний план",
  "periodCorrectionPlan": "Уточнений план за період",
  "periodDone": "Виконано за період",
  "deviationToPeriodCorrectionPlan": "Відхилення до уточненого плану за період",
  "percentDoneToPeriodCorrectionPlan": "Відсоток виконання до уточненого плану за період",
  "percentDoneToYearCorrectionPlan": "Відсоток виконання до уточненого річного плану"
}

// App - основний компонент, у якому реалізовується весь додаток
function App() {
  let [data, setData] = React.useState([]); //дані завантажені з файлу
  let [checkedSettings, setCheckedSettings] = React.useState({columns: new Set([]), rows: new Set([])});  //Поля в settings, які потрібно показувати
  let [showFields, setShowFields] = React.useState({columns: new Set([]), rows: new Set([])}); 
  //checkedSettings та showFields зроблені окремо, щоб зміна в налаштуваннях відображуваних полів checkedSettings впливала на відображення саміх полів лише після натискання кнопки підтвердити
  let [columnNames, setColumnNames] = React.useState([]); //Перелік усіх полів, що можуть бути (у випадку якщо в якомусь об'єкті немає якогось поля, буде вставлено пробіл)
  let [codes, setCodes] = React.useState({}); // Перетворені дані з масиву до вигляду з рівнями
  let [isLoading, setIsLoading] = React.useState(true); // Поки завантажуються дані через API відображається вікно Loading, після завантаження даних - зникає
  //let [isLoading, setIsLoading] = React.useState(false); // Поки завантажуються дані через API відображається вікно Loading, після завантаження даних - зникає
  
  // Функція для перетворення даних, що надійшли у вигляді масиву до вигляду дерева з рівнями за кодами бюджетної класифікації
  function convertingDataToTree(data) {
    let codesTree = {};
    let index;

    if (data.length > 0 && +data[0]['incomeCode'] === 0) {
      index = 1;
    } else {
      index = 0;
    }

    while (index < data.length) {
      let code = data[index]['incomeCode'];
      let codeLevel;

      if (code.slice(1, -1) == 0) {
        codeLevel = code.slice(0, 1);
      } else if (code.slice(2, -1) == 0) {
        codeLevel = code.slice(0, 2);
      } else if (code.slice(4, -1) == 0){
        codeLevel = code.slice(0, 4);
      } else {
        codeLevel = code.slice(0, 6);
      }

      codesTree[code] = {};
      codesTree[code]['codes'] = {};
      codesTree[code]['incomeCodeName'] = data[index]['incomeCodeName'];
      codesTree[code]['yearCorrectionPlan'] = data[index]['yearCorrectionPlan'];
      codesTree[code]['percentDoneToYearCorrectionPlan'] = data[index]['percentDoneToYearCorrectionPlan'];
      codesTree[code]['periodDone'] = data[index]['periodDone'];
      [codesTree[code]['codes'], index] = createCodesTree(data, index, codeLevel);
    }

    if (data.length > 0 && +data[0]['incomeCode'] === 0) {
      let mainCode = data[0]['incomeCode'];
      setCodes({
        [mainCode]: {
          'codes': codesTree,
          'incomeCodeName': data[0]['incomeCodeName'],
          'yearCorrectionPlan': data[0]['yearCorrectionPlan'],
          'percentDoneToYearCorrectionPlan': data[0]['percentDoneToYearCorrectionPlan'],
          'periodDone': data[0]['periodDone'],
        }
      });
    } else {
      setCodes(codesTree);
    }

    function createCodesTree(data, prevID, prevCodeLevel) {
      let currentID = prevID+1;
      if (!data[currentID]) return [null, currentID];
      
      let code = data[currentID]['incomeCode'];
      let codeLevel = code.slice(0, prevCodeLevel.length);
      let currentCodeTree = {};
      
      if (prevCodeLevel === codeLevel){
        while (prevCodeLevel === codeLevel) {
          currentCodeTree[code] = {};
          
          [currentCodeTree[code]['codes'], index] = createCodesTree(data, currentID, code.slice(0, codeLevel.length === 1 ? codeLevel.length+1 : codeLevel.length+2));
          
          currentCodeTree[code]['incomeCodeName'] = data[currentID]['incomeCodeName']
          currentCodeTree[code]['yearCorrectionPlan'] = data[currentID]['yearCorrectionPlan']
          currentCodeTree[code]['percentDoneToYearCorrectionPlan'] = data[currentID]['percentDoneToYearCorrectionPlan']
          currentCodeTree[code]['periodDone'] = data[currentID]['periodDone']

          currentID = index;
          if (!data[currentID]) return [currentCodeTree, currentID];
          code = data[currentID]['incomeCode'];
          codeLevel = code.slice(0, prevCodeLevel.length);
        }
        return [currentCodeTree, index];
      } else {
        return [null, prevID+1];
      }
    }
  }

  /*------------------------------------------------------------------------------------------------------------- */
  // React.useEffect - хук, завдяки якому React запам'ятає передану у нього функцію і викличе її після того, як внесе всі зміни в DOM, тобто після рендеру сторінки.
  // React.useEffect виконає передану функцію та внесе зміни в DOM, коли будуть змінені дані у змінній data
  React.useEffect(() => {
    let fieldsList = new Set();
    data.forEach(obj => {
      Object.keys(obj).forEach(item => {
      fieldsList.add(item)
      })
    });
    
    setColumnNames(Array.from(fieldsList));

    let columns = [];
    for (let i = 0; i < fieldsList.size; i++) {
      columns.push(i);
    }
    let rows = [];
    data.forEach((obj, index) => {
      rows.push(obj['incomeCode']);
    })
    
    setCheckedSettings({...checkedSettings, rows: new Set([...rows]), columns: new Set([...columns])});
    setShowFields({...showFields, rows: new Set([...rows]), columns: new Set([...columns])});  
    convertingDataToTree(data);
  }, [data])



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

  // Контен (html-структура), що відображає даний компонент на сторінці
  return (
    <> 
      <div className="app">
        {!isLoading &&
          <div className='loading'>
            <img className="loading__icon" src={loading} alt="Loading..." />
          </div>
        }
        <header className="header">
          <div className="container">
            <nav className="header__menu">
              <NavLink className={({ isActive }) => isActive ? "header__link _active" : "header__link"} to="graduate-work-mvv/">Головна</NavLink>
              <NavLink className={({ isActive }) => isActive ? "header__link _active" : "header__link"} to="graduate-work-mvv/data">Вибірка даних</NavLink>
              <NavLink className={({ isActive }) => isActive ? "header__link _active" : "header__link"} to="graduate-work-mvv/diagram">Діаграми</NavLink>
            </nav>
          </div>
        </header>
        
        <main className="page">
          <Routes> 
            <Route path="graduate-work-mvv/" element={<MainPage />}/>
            <Route path="graduate-work-mvv/data" element={<DataPage data={data} showFields={showFields} setShowFields={setShowFields} codes={codes} renamedColumnNames={renamedColumnNames} columnNames={columnNames} checkedSettings={checkedSettings} setCheckedSettings={setCheckedSettings} setData={setData} setIsLoading={setIsLoading} startDate={startDate} allDates={allDates} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>}/>
            <Route path="graduate-work-mvv/diagram/*" element={<InfographicPage data={data} renamedColumnNames={renamedColumnNames} codes={codes} setData={setData} setIsLoading={setIsLoading} startDate={startDate} allDates={allDates} selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>}>
              <Route path="plan-done" element={<PlanDone data={data} />}/>
              <Route path="plan-done-by-types" element={<PlanDoneByTypes data={data} renamedColumnNames={renamedColumnNames} codes={codes}/>}/>
              <Route path="chart-tax" element={<ChartTax data={data} renamedColumnNames={renamedColumnNames} codes={codes} />}/>
            </Route>
          </Routes>
        </main>
        <footer className='footer'>
          <div className="container">
            <div className="footer__text">
              Дані отримані з веб-порталу Open budget
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
