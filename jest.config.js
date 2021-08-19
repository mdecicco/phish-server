const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    moduleDirectories: [
        '<rootDir>/src',
        'node_modules'
    ],
    moduleNameMapper: {
        '^@components$': '<rootDir>/src/components',
        '^@pages$': '<rootDir>/src/pages',
        '^@api$': '<rootDir>/src/api',
        '^@utils$': '<rootDir>/src/utils',
        '^@hooks$': '<rootDir>/src/hooks',
        '^@constants$': '<rootDir>/src/constants',
        '^@types$': '<rootDir>/src/types'
    }
};

module.exports = config;