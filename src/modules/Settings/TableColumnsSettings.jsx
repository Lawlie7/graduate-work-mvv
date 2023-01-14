import React from 'react'
import './TableSettings.css'

// Компонент з налаштуваннями для стовпців
function TableColumnsSettings({ columnNames, checkedSettings, setCheckedSettings, renamedColumnNames }) {
    // Функція, що робить натиснуте поле в налаштуваннях активним / неактивним
    const onColumn = (e) => {
        let index = +e.currentTarget.dataset.index;
        if (checkedSettings.columns.has(index)) { 
            setCheckedSettings(previousState => ({...previousState, columns: new Set([...previousState.columns].filter(value => value !== index))})); 
        } else {
            setCheckedSettings(previousState => ({...previousState, columns: new Set([...previousState.columns, index])}));
        }
    };
    
    // Контен (html-структура), що відображає даний компонент на сторінці
    return (
        <ul className="settings-columns__list">
            {columnNames.map((item, index) => 
                <li className={`settings-columns__item ${checkedSettings.columns.has(index) ? "_active" : ''}`} onClick={onColumn} title={renamedColumnNames.hasOwnProperty(item) ? renamedColumnNames[item] : item} data-index={index} key={`settings-columns_${renamedColumnNames[item]}_${index}`}>
                    {renamedColumnNames.hasOwnProperty(item) ? renamedColumnNames[item] : item}
                </li>
            )}
        </ul>
    )
}

export default TableColumnsSettings
