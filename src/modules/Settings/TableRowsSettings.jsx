import React from 'react'
import './TableSettings.css'

// Компонент з налаштуваннями для рядків
function TableRowsSettings({data, codes, setSearchedData, setCheckedSettings, checkedSettings}) {
    // Функція, що робить натиснуте поле (або натиснуте поле і всі поля, що є його підрівнями) в налаштуваннях активним / неактивним
    function onCategory(e) {
        let rows = [];
        if (e.ctrlKey) {
            if(+e.currentTarget.dataset.minValue === 0) {
                data.forEach(obj => {
                    rows.push(obj['incomeCode']);
                })
            } else {
                let minValue = +e.currentTarget.dataset.minValue;
                let maxValue = +e.currentTarget.dataset.maxValue;
                data.forEach(obj => {
                    let objValue = +obj['incomeCode'];
                    if (objValue >= minValue && objValue < maxValue ) rows.push(obj['incomeCode']);
                });
            }           
        } else {
            let value = +e.currentTarget.dataset.minValue;
            data.forEach(obj => {
                let objValue = +obj['incomeCode'];
                if (objValue === value ) rows.push(obj['incomeCode']);
            });
        }
        if (checkedSettings.rows.has(rows[0])) {
            setCheckedSettings(previousState => ({...previousState, rows: new Set([...previousState.rows].filter(code => !rows.includes(code)))}))
        } else {
            setCheckedSettings(previousState => ({...previousState, rows: new Set([...previousState.rows, ...rows])}));
        }
    }
    // Контен (html-структура), який відображається даним компонентом на сторінці
    return (
        <ul className="settings-rows__list">
            <CreateCodesTree data={data} codes={codes} setSearchedData={setSearchedData} onCategory={onCategory} checkedSettings={checkedSettings}/>
        </ul>
    )
}

export default TableRowsSettings

// Допоміжний компонент, що викликається у вигляді рекурсії, який відображає поля з кодами по рівнях
const CreateCodesTree = ({ data, codes, onCategory, checkedSettings, nextCode = null }) => {
    // Контен (html-структура), який відображається даним компонентом на сторінці
    return (
        <>
            {Object.keys(codes).map((code, index) => {
                if (codes[code]['codes'] === null) {
                    return <li className="settings-rows__item" key={`settings-rows_${code}_${index}`}>
                        <div className={`settings-rows__text ${checkedSettings.rows.has(code) ? "_active" : ''}`} onClick={onCategory} title={codes[code]['incomeCodeName']} 
                        data-min-value={code} data-max-value={Object.keys(codes)[index + 1] ? Object.keys(codes)[index + 1] : +code + 1}>
                            <span className="settings-rows__code">{code}</span> - {codes[code]['incomeCodeName']}
                        </div>
                    </li>
                } else {
                    return <li className="settings-rows__item" key={`settings-rows_${code}_${index}`}>
                        <div className={`settings-rows__text ${checkedSettings.rows.has(code) ? "_active" : ''}`} onClick={onCategory} title={codes[code]['incomeCodeName']} 
                        data-min-value={code} data-max-value={Object.keys(codes)[index + 1] ? Object.keys(codes)[index + 1] : (+nextCode === 0 ? (codes[code]['codes'][Object.keys(codes[code]['codes'])[Object.keys(codes[code]['codes']).length - 1]] ? Object.keys(codes[code]['codes'][Object.keys(codes[code]['codes'])[Object.keys(codes[code]['codes']).length - 1]]) : +nextCode) : +nextCode)}>
                            <span className="settings-rows__code">{code}</span> - {codes[code]['incomeCodeName']}
                        </div>
                        <ul className="settings-rows__list">
                            <CreateCodesTree data={data} codes={codes[code]['codes']} onCategory={onCategory} checkedSettings={checkedSettings} 
                            nextCode={ Object.keys(codes)[index + 1] ? Object.keys(codes)[index + 1] : ((nextCode === null || +nextCode === 0) ? +data[data.length - 1]['incomeCode']+1 : nextCode )}/>
                        </ul>
                    </li>
                }
            })}
        </>
    )
};