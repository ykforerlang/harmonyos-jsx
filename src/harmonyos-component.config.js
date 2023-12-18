
module.exports = {
    TextInput: {
        hasChild: false,
        options: new Set(["placeholder", "text", "controller"])
    },
    Divider: {
        hasChild: false,
    },
    Row: {
        hasChild: true,
        options: new Set(["space"])
    },
    Column: {
        hasChild: true,
        options: new Set(["space"])
    }
}
