import React from 'react'

import TableColumnsSettings from './TableColumnsSettings'
import TableRowsSettings from './TableRowsSettings'

// Компонент, що відображає блок налаштувань
function TableSettings({ data, codes, setSearchedData, columnNames, setShowFields, checkedSettings, setCheckedSettings, renamedColumnNames, typeSettings }) {
    // Функція, що викликається при натисканні на кнопку "Підтвердити" та зберігає поля, що мають бути відображенні
    const handleSubmitForm = (e) => {
        e.preventDefault();
        setShowFields(previousState => ({...previousState, columns: new Set([...checkedSettings.columns]), rows: new Set([...checkedSettings.rows])}));
    };
    // Функція, що викликається при натисканні на кнопку "Очистити всі" та робить всі поля налаштувань неактивними
    const unselectAll = (e) => {
        if(typeSettings.columns) {
            setCheckedSettings(previousState => ({...previousState, columns: new Set([])}));
        } else {
            setCheckedSettings(previousState => ({...previousState, rows: new Set([])}));
        }
    };
    // Функція, що викликається при натисканні на кнопку "Вибрати всі" та робить всі поля налаштувань активними
    const selectAll = (e) => {
        if(typeSettings.columns) {
            let columns = [];
            for (let i = 0; i < columnNames.length; i++) {
                columns.push(i);
            }
            setCheckedSettings(previousState => ({...previousState, columns: new Set([...columns])}));
        } else {
            let rows = [];
            data.forEach((obj, index) => {
                rows.push(obj['incomeCode']);
            })
            setCheckedSettings(previousState => ({...previousState, rows: new Set([...rows])}));
        }
    };
    
    // Контен (html-структура), що відображає даний компонент на сторінці
    return (
        <form onSubmit={handleSubmitForm} className="table__settings settings-table">
            <div className="settings-table__filters">
                <button className="settings-table__filter" type="button" onClick={selectAll}>Вибрати всі</button>
                <button className="settings-table__filter" type="button" onClick={unselectAll}>Очистити всі</button>
            </div>
            {typeSettings.columns 
                ? <TableColumnsSettings data={data} columnNames={columnNames} setShowFields={setShowFields} setCheckedSettings={setCheckedSettings} checkedSettings={checkedSettings} renamedColumnNames={renamedColumnNames}/>
                : <TableRowsSettings codes={codes} data={data} setSearchedData={setSearchedData} setCheckedSettings={setCheckedSettings} checkedSettings={checkedSettings}/>
            }
            <button className="settings-table__btn" type="submit" value="Submit">Підтвердити</button>
        </form>
    )
}

export default TableSettings