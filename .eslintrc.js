module.exports = {
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'prefer-arrow-callback': 'error'
    },
    env: {
        webextensions: true,
        browser: true
    },
    parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest"
    },
    ignorePatterns: ["./dist/"]
};
