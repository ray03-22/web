document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar'); // カレンダー要素を取得
    const calendarTitle = document.getElementById('calendar-title'); // カレンダーのタイトルを取得

    const roomCalendars = {
        general: {
            title: '全体カレンダー',
            roomKey: 'general',
        },
        room201: {
            title: '201号室カレンダー',
            roomKey: 'room201',
        },
        room202: {
            title: '202号室カレンダー',
            roomKey: 'room202',
        },
        room203: {
            title: '203号室カレンダー',
            roomKey: 'room203',
        },
    };

    let currentRoomKey = 'general';
    let calendar = initializeCalendar(currentRoomKey);

    // カレンダーを初期化
    function initializeCalendar(roomKey) {
        calendarTitle.textContent = roomCalendars[roomKey].title;
        const room = roomCalendars[roomKey].roomKey;

        return new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            editable: true,
            selectable: true,
            events: function (info, successCallback, failureCallback) {
                fetch(`/get-events/${room}`)
                    .then((response) => response.json())
                    .then((data) => successCallback(data))
                    .catch((error) => failureCallback(error));
            },
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridDay',
            },
            dateClick: function (info) {
                if (roomKey === 'general') {
                    alert('全体カレンダーでは直接イベントを追加できません。部屋ごとに追加してください。');
                    return;
                }
                const title = prompt('イベントタイトルを入力してください:');
                if (title) {
                    const newEvent = {
                        room: room,
                        title: title,
                        start: info.dateStr,
                        end: null,
                    };
                    fetch('/add-event', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newEvent),
                    })
                        .then((response) => response.json())
                        .then(() => {
                            calendar.refetchEvents(); // イベントを再取得
                            alert('イベントが追加されました！');
                        });
                }
            },
            eventDrop: function (info) {
                const updatedEvent = {
                    id: info.event.id,
                    start: info.event.start.toISOString(),
                    end: info.event.end ? info.event.end.toISOString() : null,
                };
                fetch('/update-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedEvent),
                })
                    .then((response) => response.json())
                    .then(() => {
                        alert('イベントが更新されました！');
                    })
                    .catch(() => {
                        alert('エラーが発生しました。');
                        info.revert();
                    });
            },
            eventResize: function (info) {
                const updatedEvent = {
                    id: info.event.id,
                    start: info.event.start.toISOString(),
                    end: info.event.end ? info.event.end.toISOString() : null,
                };
                fetch('/update-event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedEvent),
                })
                    .then((response) => response.json())
                    .then(() => {
                        alert('イベントの時間が更新されました！');
                    })
                    .catch(() => {
                        alert('エラーが発生しました。');
                        info.revert();
                    });
            },
        });
    }

    // カレンダーを切り替える
    window.showCalendar = function (roomKey) {
        calendar.destroy();
        currentRoomKey = roomKey;
        calendar = initializeCalendar(roomKey);
        calendar.render();
    };

    // 初期カレンダーを描画
    calendar.render();
});
