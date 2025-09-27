const AuthService = require('./authService');
const AuthResponse = require("../dtos/response/AuthResponse");
const User = require('../models/User');
const Sender = require('../models/Sender');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, useSupabase } = require("../config/env");
const { supabaseService, isDemoMode } = require('../db/supabaseClient');
const RegisterValidator = require('../validators/registerValidator')
const LoginValidator = require('../validators/loginValidator')

// In-memory user store for demo purposes
const demoUsers = new Map();

class AuthServiceImpl extends AuthService {
    constructor() {
        super();
    }

    async register(registerRequest) {
        const validated = RegisterValidator.validate(registerRequest)

        if (useSupabase && supabaseService && !isDemoMode) {
            const { data: existing, error: errExisting } = await supabaseService.from('users').select('id').eq('email', validated.email).maybeSingle();
            if (errExisting) throw new Error(errExisting.message);
            if (existing) throw new Error('Email already exists');
            const hashedPassword = await bcrypt.hash(validated.password, 10);
            const payload = {
                first_name: validated.firstName,
                last_name: validated.lastName,
                email: validated.email,
                password_hash: hashedPassword,
                role: validated.role,
            };
            const { error: errIns } = await supabaseService.from('users').insert(payload);
            if (errIns) throw new Error(errIns.message);
            return new AuthResponse("User registered successfully", true)
        }

        // Demo mode: Use in-memory storage
        if (isDemoMode) {
            // Check if user already exists
            if (demoUsers.has(validated.email)) {
                throw new Error("Email already exists");
            }

            // Hash password and store user
            const hashedPassword = await bcrypt.hash(validated.password, 10);
            const userId = Date.now().toString();

            const userData = {
                id: userId,
                firstName: validated.firstName,
                lastName: validated.lastName,
                email: validated.email,
                password: hashedPassword,
                role: validated.role,
                walletAddress: validated.walletAddress,
                createdAt: new Date()
            };

            demoUsers.set(validated.email, userData);
            return new AuthResponse("User registered successfully", true);
        }

        // Fallback to MongoDB
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) throw new Error("Email already exists");
        const hashedPassword =  await bcrypt.hash(validated.password, 10);
        const userData = { ...validated, password: hashedPassword };
        if(userData.role === 'sender') {
            await Sender.create(userData);
        } else if(userData.role === "vendor") {
            await Vendor.create(userData);
        } else {
            throw new Error("Invalid role");
        }
        return new AuthResponse("User registered successfully", true)
    }

    async login(loginRequest) {
        const validated = LoginValidator.validate(loginRequest);

        // Check if we're in demo mode (placeholder Supabase credentials)
        const isDemoMode = !supabaseService;

        if (useSupabase && supabaseService && !isDemoMode) {
            const { data: user, error } = await supabaseService
                .from('users')
                .select('id, email, password_hash, role')
                .eq('email', validated.email)
                .single();
            if (error || !user) throw new Error('Invalid email');
            const isPasswordValid = await bcrypt.compare(validated.password, user.password_hash || '');
            if(!isPasswordValid) throw new Error('Invalid password');
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: '1h' }
            );
            return { token, user: { id: user.id, email: user.email, role: user.role } }
        }

        // Demo mode: Use in-memory storage
        if (isDemoMode) {
            // Create demo user if it doesn't exist
            if (!demoUsers.has('quayyumariyo@gmail.com')) {
                const hashedPassword = await bcrypt.hash('monkeyss', 10);
                const demoUser = {
                    id: 'demo-user-123',
                    firstName: 'Quayyum',
                    lastName: 'Ariyo',
                    email: 'quayyumariyo@gmail.com',
                    password: hashedPassword,
                    role: 'sender',
                    walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                    createdAt: new Date()
                };
                demoUsers.set('quayyumariyo@gmail.com', demoUser);
                console.log('🎯 Demo user created:', demoUser.email);
            }

            const user = demoUsers.get(validated.email);
            if (!user) {
                // If it's the demo email and user doesn't exist, create it
                if (validated.email === 'quayyumariyo@gmail.com') {
                    const hashedPassword = await bcrypt.hash('monkeyss', 10);
                    const demoUser = {
                        id: 'demo-user-123',
                        firstName: 'Quayyum',
                        lastName: 'Ariyo',
                        email: 'quayyumariyo@gmail.com',
                        password: hashedPassword,
                        role: 'sender',
                        walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                        createdAt: new Date()
                    };
                    demoUsers.set('quayyumariyo@gmail.com', demoUser);
                    console.log('🎯 Demo user created on login:', demoUser.email);
                } else {
                    throw new Error("Invalid email");
                }
            }

            const userToCheck = demoUsers.get(validated.email);
            const isPasswordValid = await bcrypt.compare(validated.password, userToCheck.password);
            if (!isPasswordValid) throw new Error("Invalid password");

            const token = jwt.sign(
                { id: userToCheck.id, email: userToCheck.email, role: userToCheck.role, walletAddress: userToCheck.walletAddress },
                jwtSecret,
                { expiresIn: "1h" }
            );
            return { token, user: { id: userToCheck.id, email: userToCheck.email, role: userToCheck.role, walletAddress: userToCheck.walletAddress } }
        }

        // Fallback to MongoDB
        const user = await User.findOne({ email: validated.email})
        if(!user) throw new Error("Invalid email");
        const isPasswordValid = await bcrypt.compare(validated.password, user.password);
        if(!isPasswordValid) throw new Error("Invalid password");
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, walletAddress: user.walletAddress },
            jwtSecret,
            { expiresIn: "1h"}
        );
        return { token, user: { id: user.id, email: user.email, role: user.role, walletAddress: user.walletAddress } }
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, jwtSecret);
        } catch(error) {
            throw new Error("Invalid or expired");
        }
    }
}

module.exports = AuthServiceImpl
