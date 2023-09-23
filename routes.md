## Questions
are we rate-limiting????

## API Routes
``` WS /game ```
- all players connect to this websocket after joining
- get a notification when a new player joins
- will push notifications to users when someone makes progress (passes one or more test cases)
- will also push a final notification that signifies game is over

``` GET /question ```
- returns the text and inputs for the question of the day
- see response body below
{
    "question": "find the smallest number in this array",
    "inputs": [
        "[1,2,3]",
        "[]",
        [5,12]"
    ]
}

``` POST /answer ```
- request body
{
    "user_id": "dconway",
    responses: [ 2, 3, 0 ]
}
- response body
{
    "hasWon": false,
    "missedQuestions": [ 1, 3 ]
}
