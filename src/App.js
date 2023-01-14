import React from 'react';
import './App.css';

import loading from './images/loading.gif'

import Table from './modules/Table/Table';
import TableTypeSettings from './modules/Settings/TableTypeSettings';
import Search from './modules/Search/Search';
import TableSettings from './modules/Settings/TableSettings';
import Infographics from './modules/Infographics/Infographics';
import Upload from './modules/Upload/Upload';
import Download from './modules/Download/Download';

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
  let [searchedData, setSearchedData] = React.useState([]); //дані, що шукаються через поле пошуку
  let [checkedSettings, setCheckedSettings] = React.useState({columns: new Set([]), rows: new Set([])});  //Поля в settings, які потрібно показувати
  let [showFields, setShowFields] = React.useState({columns: new Set([]), rows: new Set([])}); 
  //checkedSettings та showFields зроблені окремо, щоб зміна в налаштуваннях відображуваних полів checkedSettings впливала на відображення саміх полів лише після натискання кнопки підтвердити
  let [columnNames, setColumnNames] = React.useState([]); //Перелік усіх полів, що можуть бути (у випадку якщо в якомусь об'єкті немає якогось поля, буде вставлено пробіл)

  let [typeSettings, setTypeSettings] = React.useState({ columns: true, rows: false})

  let [codes, setCodes] = React.useState({});

  let [isLoading, setIsLoading] = React.useState(false);
  
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
    setSearchedData(data);

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

  // Контен (html-структура), що відображає даний компонент на сторінці
  return (
    <div className="app">
      {!isLoading &&
        <div className='loading'>
          <img className="loading__icon" src={loading} alt="Loading..." />
        </div>
      }
      <div className="app__main app-main">
        <div className="container">
          <div className="app-main__inner">
            <Upload setData={setData} setIsLoading={setIsLoading}/>

            <div className="app-main__table-block table-block">
              <div className="table-block__column table-block__column_table">
                <Search data={data} setSearchedData={setSearchedData} showFields={showFields}/>
                <div className="table-block__table">
                  {searchedData.length > 0
                    ? <Table codes={codes} columnNames={columnNames} showFields={showFields} renamedColumnNames={renamedColumnNames} searchedData={searchedData}/>
                    : <div className="info">Немає даних</div>
                  }
                </div>
              </div>
              <div className="table-block__column table-block__column_settings">
                <TableTypeSettings typeSettings={typeSettings} setTypeSettings={setTypeSettings}/>
                <div className="table-block__settings">
                  {data.length > 0
                    ? <TableSettings codes={codes} typeSettings={typeSettings} data={data} setSearchedData={setSearchedData} columnNames={columnNames} setShowFields={setShowFields} setCheckedSettings={setCheckedSettings} checkedSettings={checkedSettings} renamedColumnNames={renamedColumnNames}/>
                    : <div className="info">Немає даних</div>
                  }
                </div>
              </div>
            </div>

            <Download data={data} columnNames={columnNames} showFields={showFields}/>
          </div>
        </div>
      </div>
      {data.length > 1 && Object.keys(codes).length !== 0 &&
        <div className="app__infographics app-infographics">
          <div className="container">
            <div className="app-infographics__inner">
              <Infographics data={data} renamedColumnNames={renamedColumnNames} codes={codes}/>
            </div>
          </div>
        </div>
      }
      <div className='open-budget'>
        <div className="container">
          <div className="open-budget__text">
            Дані отримані з веб-порталу Open budget
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
