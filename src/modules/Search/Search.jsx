import React from 'react'
import searchIcon from '../../images/search-icon.svg'
import './Search.css'

// Компонент, що реалізує поле для пошуку даних по таблиці
function Search({data, setSearchedData, showFields}) {
    let [inputValue, setInputValue] = React.useState(''); // Зберігає значення введене у поле пошуку

    // Функція викликається при кожній зміні символа у молі пошуку і встановлює значення у змінну inputValue
    function changeValue(event) {
        setInputValue(event.target.value)
    };
    // Функція, що перевіряє на наявність у таблиці даних шуканих за допомогою поля пошуку і зберігає їх у змінну searchedData
    function search(event) {
        event.preventDefault();
        setSearchedData(data.filter(obj => {
            return Object.values(obj).filter((item, index) => showFields.columns.has(index)).toString().toLowerCase().includes(inputValue.toLowerCase());
        }))
    };
    // Контен (html-структура), який відображається даним компонентом на сторінці
    return (
        <form className="search" onSubmit={search} >
            <input className="search__input" type="text" value={inputValue} onChange={changeValue}/>
            <button className="search__button" type="submit" value="Submit">
                <img className='search__icon' src={searchIcon} alt="search-icon" />
            </button>
        </form>
    )
}

export default Search