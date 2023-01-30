import React from 'react'
import Table from './Table/Table.jsx';
import TableTypeSettings from '../Settings/TableTypeSettings.jsx';
import Search from '../Search/Search.jsx';
import TableSettings from '../Settings/TableSettings.jsx';

import './TableBlock.css';


// Компонент, що відображає блок з таблицею: поле пошуку, саму таблицю та налаштування таблицы
function TableBlock({data, showFields, setShowFields, codes, renamedColumnNames, columnNames, checkedSettings, setCheckedSettings}) {
    let [typeSettings, setTypeSettings] = React.useState({ columns: true, rows: false}); // Встановлення типу редагування таблиці (редагевання рядків чи стовпців)
    let [searchedData, setSearchedData] = React.useState([]); // Шукані дані за допомогою поля пошуку

    // У змінну searchedData у вигляді шуканих даних за замовчуванням встановлюються і відображаються всі дані, що надійшли із сервера
    React.useEffect(() => {
        setSearchedData(data);
    }, [data])
    
    // Контен (html-структура), який відображається даним компонентом на сторінці
    return (
        <div className="table-block">
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
    )
}

export default TableBlock