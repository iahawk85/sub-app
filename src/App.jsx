import React, { useState, useEffect } from 'react'
  import { UserCircle2 } from 'lucide-react'

  const App = () => {
    const [players, setPlayers] = useState([])

    const [newPlayerNames, setNewPlayerNames] = useState('')
    const [newPlayerPosition, setNewPlayerPosition] = useState('Wing')
    const [timerDuration, setTimerDuration] = useState(2)
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [timerId, setTimerId] = useState(null)

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const startTimer = () => {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            const totalSeconds = timerDuration * 60
            setRemainingTime(totalSeconds)
            setIsTimerRunning(true)
            const interval = setInterval(() => {
              setRemainingTime((prev) => {
                if (prev <= 1) {
                  clearInterval(interval)
                  setIsTimerRunning(false)
                  return 0
                }
                return prev - 1
              })
            }, 1000)
            setTimerId(interval)
          }
        })
      } else {
        const totalSeconds = timerDuration * 60
        setRemainingTime(totalSeconds)
        setIsTimerRunning(true)
        const interval = setInterval(() => {
          setRemainingTime((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setIsTimerRunning(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        setTimerId(interval)
      }
    }

    const clearTimer = () => {
      if (timerId) clearInterval(timerId)
      setIsTimerRunning(false)
      setRemainingTime(0)

      // Show push notification when timer ends
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Substitution Timer', {
          body: 'The substitution timer has ended!',
          icon: '/path/to/icon.png' // Optional
        })
      }
    }

    const togglePlayer = (id) => {
      setPlayers(players.map(player => {
        if (player.id === id) {
          const newStatus = !player.onField
          if (player.buddy) {
            const buddyIndex = players.findIndex(p => p.id === player.buddy)
            if (buddyIndex !== -1) {
              players[buddyIndex].onField = !players[buddyIndex].onField
            }
          }
          return { ...player, onField: newStatus }
        }
        return player
      }))
    }

    const substituteAllPlayers = () => {
      const newPlayers = players.map(player => ({
        ...player,
        onField: !player.onField
      }));

      newPlayers.forEach(player => {
        if (player.buddy) {
          const buddyIndex = newPlayers.findIndex(p => p.id === player.buddy);
          if (buddyIndex !== -1) {
            // Ensure only one buddy is on the field
            if (newPlayers[buddyIndex].onField === player.onField) {
              newPlayers[buddyIndex].onField = !player.onField;
            }
          }
        }
      });

      setPlayers(newPlayers);
    }

    const addPlayers = () => {
      if (!newPlayerNames.trim()) return;

      const names = newPlayerNames.split(',').map(name => name.trim());
      const numPlayers = names.length;

      if (numPlayers === 2) {
        // Automatically assign buddies
        const player1 = {
          id: players.length + 1,
          name: names[0],
          position: newPlayerPosition,
          onField: false,
          buddy: players.length + 2 // ID of player2
        };

        const player2 = {
          id: players.length + 2,
          name: names[1],
          position: newPlayerPosition,
          onField: false,
          buddy: players.length + 1 // ID of player1
        };

        setPlayers(prevPlayers => [...prevPlayers, player1, player2]);
      } else {
        // Proceed with existing logic for other cases
        names.forEach((name, index) => {
          if (name) {
            const newPlayer = {
              id: players.length + 1 + index,
              name: name,
              position: newPlayerPosition,
              onField: false,
              buddy: null
            };

            setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
          }
        });
      }

      setNewPlayerNames('');
    }

    useEffect(() => {
      if (typeof Notification !== 'undefined') {
        if (Notification.permission !== 'granted') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              console.log('Notification permission granted.');
            }
          });
        }
      }
    }, []);

    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Football Substitution App</h1>
          
          {/* Timer Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Substitution Timer</h2>
            <div className="flex items-center justify-center space-x-4">
              <select
                value={timerDuration}
                onChange={(e) => setTimerDuration(parseInt(e.target.value))}
                className="border p-2 rounded-lg w-32 pl-2 pr-2 text-sm whitespace-nowrap"
              >
                {[2, 3, 4, 5].map((min) => (
                  <option key={min} value={min}>{min} minutes</option>
                ))}
              </select>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-blue-600">{formatTime(remainingTime)}</span>
                <button
                  onClick={isTimerRunning ? clearTimer : startTimer}
                  className={`px-4 py-2 rounded-lg ${isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                >
                  {isTimerRunning ? 'Stop' : 'Start'}
                </button>
                <button
                  onClick={clearTimer}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={substituteAllPlayers}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Substitute All
                </button>
              </div>
            </div>
          </div>

          {/* Add Players Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Add Players</h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newPlayerNames}
                onChange={(e) => setNewPlayerNames(e.target.value)}
                placeholder="Enter player names (comma-separated)"
                className="border p-2 rounded-lg w-1/2"
              />
              <select
                value={newPlayerPosition}
                onChange={(e) => setNewPlayerPosition(e.target.value)}
                className="border p-2 rounded-lg w-32 pl-2 pr-2 text-sm whitespace-nowrap"
              >
                <option value="Wing">Wing</option>
                <option value="Rover">Rover</option>
                <option value="Middle">Middle</option>
                <option value="Link">Link</option>
              </select>
              <button onClick={addPlayers} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Add Players
              </button>
            </div>
          </div>

          {/* Players Section */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">On Field</h2>
              <div className="space-y-4">
                {players.filter(player => player.onField).map(player => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <UserCircle2 className="w-8 h-8 mr-2" />
                      <span>{player.name} - {player.position}</span>
                      {player.buddy && (
                        <span> (Buddy: {players.find(p => p.id === player.buddy)?.name})</span>
                      )}
                    </div>
                    <button onClick={() => togglePlayer(player.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                      Sub Out
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Bench</h2>
              <div className="space-y-4">
                {players.filter(player => !player.onField).map(player => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <UserCircle2 className="w-8 h-8 mr-2" />
                      <span>{player.name} - {player.position}</span>
                      {player.buddy && (
                        <span> (Buddy: {players.find(p => p.id === player.buddy)?.name})</span>
                      )}
                    </div>
                    <button onClick={() => togglePlayer(player.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg">
                      Sub In
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  export default App
