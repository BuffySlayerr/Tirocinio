const TDbase = {
    title: "RelativisticRoom",
    description: "A simple room with a heater and a cooler",
    properties: {
        time: {
            type: "number",
            description: "Current time for the room",
            observable: true,
            readOnly: true,
        },
        temperature: {
            type: "number",
            description: "Current temperature in the room",
            observable: true,
            readOnly: true,
            uriVariables: {
                time: { type: "number" },
            },
        },
        temperature1: {
            type: "number",
            description: "Current temperature in the room",
            observable: true,
            readOnly: true,
            uriVariables: {
                time: { type: "number" },
            },
        },
        heater: {
            type: "boolean",
            description: "Current status of the heater",
            observable: true,
            readOnly: true,
        },
        cooler: {
            type: "number",
            description: "Current value of the cooler power",
            observable: true,
            readOnly: true,
        },
        additionalHardware: {
            type: "object",
            description: "Current value of the additional hardware",
            observable: true,
            readOnly: true,
        },
        simParameters: {
            description: "Parameters for the simulator of the room",
            type: "object",
            observable: true,
            readOnly: true,
        },
    },
    actions: {
        toggleHeater: {
            description: "Turn on/off the heater",
            input: {
                type: "boolean",
            }
        },
        toggleCooler: {
            description: "Turn on/off the cooler",
            input: {
                type: "boolean",
            }
        },
        toggleAdditionalHardware: {
            description: "Modify the additional hardware",
            input: {
                type: "object",
            }
        },
        reset: {
            description: "Reset the room",
        },
        setSimParameters: {
            description: "Set the parameters for the simulator of the room",
            input: {
                type: "object",
            }
        },
        moveToTime: {
            description: "Move the time forward",
            input: {
                type: "number",
            }
        }


    }
}

export default TDbase;