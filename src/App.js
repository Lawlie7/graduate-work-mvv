import React from 'react';
import axios from 'axios';
import {Chart as ChartJS} from 'chart.js/auto';
import MainPage from './pages/MainPage/MainPage.jsx';
import DataPage from './pages/DataPage/DataPage.jsx';
import { NavLink, Route, Routes } from 'react-router-dom';
import InfographicPage from './pages/InfographicPage/InfographicPage';
import PlanDone from './modules/Infographics/PlanDone/PlanDone';
import PlanDoneByTypes from './modules/Infographics/PlanDoneByTypes/PlanDoneByTypes';
import ChartTax from './modules/Infographics/ChartTax/ChartTax';

import loading from './images/loading.gif'
import './App.css';

// Найменування кирилицею полів даних, що надходять у json форматі після відправки запиту
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
  "percentDoneToYearCorrectionPlan": "Відсоток виконання до уточненого річного плану",
  "yearBudgetEstimate": "Річна оцінка бюджету (Budget Estimate)"
}

// App - основний компонент
function App() {
  const [data, setData] = React.useState([]); //дані завантажені з файлу
  const [checkedSettings, setCheckedSettings] = React.useState({columns: new Set([]), rows: new Set([])});  // Вибрані поля в налаштуваннях для відображення, для яких установлюється активним checkbox
  const [showFields, setShowFields] = React.useState({columns: new Set([]), rows: new Set([])});  // Колонки та рядки вибрані в налашуваннях таблиці для відображення
  //checkedSettings та showFields зроблені окремо, щоб зміна в налаштуваннях відображуваних полів checkedSettings впливала на відображення саміх полів лише після натискання кнопки підтвердити
  const [columnNames, setColumnNames] = React.useState([]); //Перелік усіх полів, що можуть бути (у випадку якщо в якомусь об'єкті немає якогось поля, буде вставлено пробіл)
  const [codes, setCodes] = React.useState({}); // Перетворені дані з масиву до вигляду з рівнями
  const [isLoading, setIsLoading] = React.useState(false); // Поки завантажуються дані через API відображається вікно Loading, після завантаження даних - зникає
  
  const [tempStartDate, setTempStartDate] = React.useState({ year: null, fromMonth: null, toMonth: null }) // Змінна, у яку тимчасово зберігаються рік та період для визначення початкових параметрів для відправки запиту, що зберігаються у змінній startDate
  const [startDate, setStartDate] = React.useState({}) // Останній рік та його максимальний період, за який можна отримати дані. Цей рік та період також використовуються для початкового відображення даних під час запуску додатку
  const [selectedDataParam, setSelectedDataParam] = React.useState({}); // Зберігаються встановлені значення для полів Рік / Період / Вид бюджету / Область, необхідні для отримання даних через API
  const [allDataParams, setAllDataParams] = React.useState({years: [], fromMonth: [], toMonth: [],}); // Доступні значення для випадаючих списків полів Рік / Період 
  
  // Визначаються поточний рік та місяць і встановлюються у змінну tempStartDate
  React.useEffect(() => {
      const today = new Date();
      setTempStartDate({  
          year: today.getFullYear(),
          fromMonth: 1,
          toMonth: today.getMonth() + 1,
      })
  }, [])

  // Дані на стороні сервера OpenBudget оновлюються із затримкою десь в 1-3 місяці (наприклад у грудні можна отримати дані максимум за вересень / жовтень)
  // Тому визначається останній рік та період, за який можна отримати найновіші дані
  // Виконується кожен раз, коли змінюються дані у змінній tempStartDate
  React.useEffect(() => {
    // Відправляється запит для отримання даних від першого до поточного місяця поточного року. Якщо даних немає (request.data.length <= 1), то відправляється запит для отримання даних за попередній місяць і так до тих пір, поки не буде знайдено місяць за який можна отримати найновіші дані
    // Для цього і потрібна тимчасова змінна tempStartDate
    axios.get(`https://openbudget.gov.ua/api/reports/income/details/JSON?budgetType=NATIONAL&fundType=TOTAL&year=${tempStartDate.year}&monthTo=${tempStartDate.toMonth}&monthFrom=${tempStartDate.fromMonth}`)
    .then(request => {
      if(request.data.length <= 1) {
        setTempStartDate( prev => {
          return {
            year: prev.toMonth > 1 ? prev.year : prev.year - 1,
            fromMonth: 1,
            toMonth: prev.toMonth > 1 ? prev.toMonth - 1 : 12,
          }
        }) // Встановлюється період на 1 місяць раніше. Наприклад був 1-й місяць 2023 року, за який немає даних, тому встановлюється 12-й місяць 2022 року. 
      } else {
        setStartDate(tempStartDate); // У змінну startDate встановлюється найновіший період за який можна отримати дані
        setSelectedDataParam({...tempStartDate, budgetType: "NATIONAL", budgetCode: "0000000000"});
        setData(request.data); // У змінну date зберігається масив даних про надходження до бюджету, що надійшов в результаті виконання запиту
        setIsLoading(true);
      }
    })
  }, [tempStartDate])

  // Формування значень для випадаючого списку для полів, де користувач може вибрати необхідні параметри для отримання даних
  React.useEffect(() => {
      let tempAllDataParams = {years: [], fromMonth: [], toMonth: []}; // Тимчасова змінна

      // Для поля Рік
      for (let i = 2018; i <= startDate.year; i++) {
        tempAllDataParams.years.push(i);    
      }

      // Для поля Період (місяць з якого)
      for (let i = 1; i <= selectedDataParam.toMonth; i++) {
        tempAllDataParams.fromMonth.push(i); 
      }
      
      // Для поля Період (місяць по який)
      let toMonth = selectedDataParam.year < startDate.year ? 12 : startDate.toMonth;
      for (let i = selectedDataParam.fromMonth; i <= toMonth; i++) {
        tempAllDataParams.toMonth.push(i); 
      }

      // Встановлення отриманих даних у змінну allDataParams
      setAllDataParams(tempAllDataParams);
  }, [selectedDataParam])

  // React.useEffect - хук, завдяки якому React запам'ятає передану у нього функцію і викличе її після того, як внесе всі зміни в DOM, тобто після рендеру сторінки.
  // React.useEffect виконає передану функцію та внесе зміни в DOM, коли будуть змінені дані у змінній data
  // Виконується, коли надійшли дані з серверу
  React.useEffect(() => {
    // Отримання найменування всіх можливих колонок
    let tempColumnNames = new Set();
    data.forEach(obj => {
      Object.keys(obj).forEach(item => {
        tempColumnNames.add(item)
      })
    });
    setColumnNames(Array.from(tempColumnNames));

    // Отримання порядкових номерів колонок, які мають відображатися. У даному випадку всі
    let columns = [];
    for (let i = 0; i < tempColumnNames.size; i++) {
      columns.push(i);
    }

    // Відображення або приховування рядків здійснюється за кодом бюджетної класифікації. Тому далі отримуються коди рядків, які мають відображатися. У даному випадку всі
    let rows = [];
    data.forEach(obj => {
      rows.push(obj['incomeCode']);
    })
    
    setCheckedSettings({...checkedSettings, rows: new Set([...rows]), columns: new Set([...columns])}); // Встановлення активних (вибраних) checkbox для полів у налаштуваннях
    setShowFields({...showFields, rows: new Set([...rows]), columns: new Set([...columns])}); // Встановлення даних про рядки та стовпці, що мають відображатися
    convertingDataToTree(data); // Виклик функції для перетворення масиву об'єктів даних до деревоподібного вигляду з рівнями за кодом бюджетної класифікації
  }, [data])

  // Функція для перетворення даних, що надійшли у вигляді масиву до вигляду дерева з рівнями за кодами бюджетної класифікації
  // Додаток Б рисунок Б2 результат роботи даної функції
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

  // Контен (html-структура), який відображає даний компонент на сторінці
  return (
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
          <Route path="graduate-work-mvv/data" element={<DataPage data={data} showFields={showFields} setShowFields={setShowFields} codes={codes} renamedColumnNames={renamedColumnNames} columnNames={columnNames} checkedSettings={checkedSettings} setCheckedSettings={setCheckedSettings} setData={setData} setIsLoading={setIsLoading} startDate={startDate} allDataParams={allDataParams} selectedDataParam={selectedDataParam} setSelectedDataParam={setSelectedDataParam}/>}/>
          <Route path="graduate-work-mvv/diagram/*" element={<InfographicPage data={data} renamedColumnNames={renamedColumnNames} codes={codes} setData={setData} setIsLoading={setIsLoading} startDate={startDate} allDataParams={allDataParams} selectedDataParam={selectedDataParam} setSelectedDataParam={setSelectedDataParam}/>}>
            <Route path="plan-done" element={<PlanDone data={data} />}/>
            <Route path="plan-done-by-types" element={<PlanDoneByTypes data={data} renamedColumnNames={renamedColumnNames} codes={codes}/>}/>
            <Route path="chart-tax" element={<ChartTax data={data} renamedColumnNames={renamedColumnNames} codes={codes} />}/>
          </Route>
        </Routes>
      </main>
      <footer className='footer'>
        <div className="container">
          <div className="footer__text">
            <p>Дані отримані з веб-порталу Open budget</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
