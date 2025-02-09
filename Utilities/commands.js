const commands = [
    {
        name: 'setupverifier',
        description: 'Setup the verifier',
    },
    {
        name: 'postclip',
        options: [
            {
                name: 'url',
                description: 'URL of the clip',
                required: true,
                type: 3,
            },
        ],
        description: 'Send a request to post a clip',
    },
    {
        name: 'clearchat',
        options: [
            {
                name: 'amount',
                description: 'Amount of messages to delete',
                required: false,
                type: 4,
            },
        ],
        description: 'Clears the chat',
    },
];

export { commands };