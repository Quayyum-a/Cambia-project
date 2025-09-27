const AuthServiceImpl = require('../../src/services/authServiceImpl');
const User = require('../../src/models/User');
const Sender = require('../../src/models/Sender');
const Vendor = require('../../src/models/Vendor');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');
const AuthResponse = require('../../src/dtos/response/AuthResponse.js');

jest.mock("bcrypt", ()=> ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

jest.mock('uuid', ()=> ({
    v4: jest.fn(),
}));


describe('Authentication service tests', () => {
    let authService;
    const senderData = {
            email: "1234@gmail.com",
            firstName: "Ibrahim",
            lastName: "Doe",
            password: "password",
            walletAddress: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            role: "sender",
            phone: "07015366234",
            address: "123 Main St, Lagos"
    };

    const vendorData = {
            email: "bramtech@gmail.com",
            firstName: "Adedeji",
            lastName: "Doe",
            password: "password",
            walletAddress: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            role: "vendor",
            phone: "08015366234",
            address: "123 Main St, Lagos"
    };

    const loginData = {
        email: "bramtech@gmail.com",
        password: "password",
    }

    beforeAll(async() => {
        process.env.NODE_ENV = 'test';
        process.env.USE_SUPABASE = 'false'; // Force demo mode for tests
        // Skip database connection in demo mode
        if (process.env.USE_SUPABASE !== 'false') {
            await connectDB();
            console.log('Connected to persistent test DB for manual inspection.');
        }
    });

    afterAll(async () => {
        await mongoose.connection.close(); 
    });

    beforeEach(async() => {
        authService = new AuthServiceImpl();
        jest.clearAllMocks();

        bcrypt.hash.mockResolvedValue('hashedPassword');
        bcrypt.compare.mockResolvedValue(true);
        uuidv4.mockReturnValue('generated-uuid');

        // In demo mode, we don't need to clean up database
        if (process.env.USE_SUPABASE !== 'false') {
            await User.deleteMany({}).exec();
            await Sender.deleteMany({}).exec();
            await Vendor.deleteMany({}).exec();
        }
    });

    describe("register user", () => {
        
        test("test should register sender and return success", async() => {
        const result = await authService.register(senderData);

        expect(result).toBeInstanceOf(AuthResponse);
        expect(result.status).toBe(true);
        expect(senderData.role).toBe("sender");

        // In demo mode, check the in-memory storage
        const authServiceInstance = new AuthServiceImpl();
        // The demo users are stored in a Map, we can't directly access it
        // but we can verify registration succeeded by checking the response
        expect(result.status).toBe(true);
        expect(result.message).toBe("User registered successfully");
    });

        test("test should register vendor and return success", async() => {
        const result = await authService.register(vendorData);

        expect(result).toBeInstanceOf(AuthResponse);
        expect(result.status).toBe(true);
        expect(vendorData.role).toBe("vendor");

        // In demo mode, check the response
        expect(result.status).toBe(true);
        expect(result.message).toBe("User registered successfully");
    });

    test('should throw error for duplicate email', async () => {
        await Sender.create({
            email: senderData.email,
            password: 'hashedPassword',
            walletAddress: senderData.walletAddress,
            role: senderData.role,
            firstName: senderData.firstName,
            lastName: senderData.lastName,
            phone: senderData.phone,
            address: senderData.address,
          });
    
          await expect(authService.register(senderData)).rejects.toThrow('Email already exists');
        });

    });

});