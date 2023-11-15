const axios = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    create: jest.fn(() => axios), // Return axios for chaining
    get: jest.fn(),
    post: jest.fn(),
    // ... other methods you want to mock
};

export default axios;
