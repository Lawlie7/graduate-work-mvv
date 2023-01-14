import React from 'react'

import cellColumn from '../../images/cell-column.png'
import cellRow from '../../images/cell-row.png'

// Компонент, що відповідає за вибір типу налаштувань: налаштування колонок чи налаштування рядків
function TableTypeSettings({typeSettings, setTypeSettings}) {
    // Функція, що встановлює активним режим налашування колонок і викликається при натисканні на відповдну кнопку
    function onCellColumn() {
        setTypeSettings({...typeSettings, columns: true, rows: false})
    }
    // Функція, що встановлює активним режим налашування рядків і викликається при натисканні на відповдну кнопку
    function onCellRow() {
        setTypeSettings({...typeSettings, columns: false, rows: true})
    }
    // Контен (html-структура), що відображає даний компонент на сторінці
    return (
        <div className="settings-table__types">
            <button className={`settings-table__type ${typeSettings.columns ? '_active' : ""}`} onClick={onCellColumn}>
                <img className="settings-table__icon" src={cellColumn} alt="Cell column" />
            </button>
            <button className={`settings-table__type ${typeSettings.rows ? '_active' : ""}`} onClick={onCellRow}>
                <img className="settings-table__icon" src={cellRow} alt="Cell row" />
            </button>
        </div>
    )
}

export default TableTypeSettings