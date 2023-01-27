import React from 'react'
import './MainPage.css';

function MainPage() {
  return (
    <div className="main">
        <div className="container">
            <div className="main__body">
                <div className="main__university">
                    <p>ДЕРЖАВНИЙ ПОДАТКОВИЙ УНІВЕРСИТЕТ</p>
                    <p>ФАКУЛЬТЕТ ФІНАНСІВ ТА ЦИФРОВИХ ТЕХНОЛОГІЙ</p>
                    <p>КАФЕДРА ІНТЕЛЕКТУАЛЬНИХ УПРАВЛЯЮЧИХ ТА ОБЧИСЛЮВАЛЬНИХ СИСТЕМ</p>
                </div>
                <div className="main__graduatу-work">
                    <h2 className="main__sup-title">Дипломна робота на тему:</h2>
                    <h1 className="main__title">«Розробка web-додатку для аналізу відкритих даних податкових надходжень»</h1>
                </div>
                <div className="main__about">
                    <p>Виконав: <span>здобувач вищої освіти групи КМІЗ-21-1, Мандрик Владислав Володимирович</span></p>
                    <p>Науковий керівник: <span>к.е.н., доцент, Редич Олександр Володимирович</span></p>
                </div>
                <p className="main__where">Ірпінь 2022-2023</p>
            </div>
        </div>
    </div>
  )
}

export default MainPage