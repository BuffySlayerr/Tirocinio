declare var thingName;
const TDbase = {
    title: thingName !== undefined ? `${thingName}` : "RelativisticTwin",
    description: "A Thing to control a simple counter",
    properties: {
        value: {
            type: "integer",
            minimum: 0,
            maximum: 5,
            description: "Current counter value",
            observable: true,
            readOnly: true,
        },
        graph: {
            type: 'object',
            description: "Current counter value",
            observable: true,
            readOnly: false,
        }
    },
    actions: {
        increment: {
            description: "Incrementing the current value with 0 to 5 increments",
            input: {
                type: "integer",
                minimum: 0,
                maximum: 5
            }
        },
        decrement: {
            description: "Decrementing the current value with 0 to 5 increments",
            input: {
                type: "integer",
                minimum: 0,
                maximum: 5
            }
        },
        time: {
            description: "Randomly incrementing or decrementing the current value of counter"
        }
    },
    events: {
        actionInvoked: {
            description: "Alert if an action has been invoked",
            type: Object
        }
    }
}

export default TDbase;