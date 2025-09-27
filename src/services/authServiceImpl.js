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
            // Pre-seed demo users for different roles
            const demoAccounts = [
                {
                    email: 'quayyumariyo@gmail.com',
                    password: 'monkeyss',
                    firstName: 'Quayyum',
                    lastName: 'Ariyo',
                    role: 'sender',
                    id: 'demo-sender-123'
                },
                {
                    email: 'vendor@cambia.com',
                    password: 'vendor123',
                    firstName: 'Adebayo',
                    lastName: 'Johnson',
                    role: 'vendor',
                    id: 'demo-vendor-456'
                },
                {
                    email: 'logistics@cambia.com',
                    password: 'logistics123',
                    firstName: 'Ngozi',
                    lastName: 'Okoro',
                    role: 'logistics',
                    id: 'demo-logistics-789'
                }
            ];

            // Create demo users if they don't exist
            for (const account of demoAccounts) {
                if (!demoUsers.has(account.email)) {
                    const hashedPassword = await bcrypt.hash(account.password, 10);
                    const demoUser = {
                        id: account.id,
                        firstName: account.firstName,
                        lastName: account.lastName,
                        email: account.email,
                        password: hashedPassword,
                        role: account.role,
                        walletAddress: `0x${account.id.replace('demo-', '').replace('-', '')}abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
                        createdAt: new Date()
                    };
                    demoUsers.set(account.email, demoUser);
                    console.log(`🎯 Demo ${account.role} user created:`, demoUser.email);
                }
            }

            const user = demoUsers.get(validated.email);
            if (!user) {
                throw new Error("Invalid email or password. In demo mode, use: quayyumariyo@gmail.com, vendor@cambia.com, or logistics@cambia.com");
            }

            const isPasswordValid = await bcrypt.compare(validated.password, user.password);
            if (!isPasswordValid) {
                throw new Error("Invalid email or password. Check demo credentials above.");
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role, walletAddress: user.walletAddress },
                jwtSecret,
                { expiresIn: "24h" } // Extended for demo convenience
            );
            return { token, user: { id: user.id, email: user.email, role: user.role, walletAddress: user.walletAddress, firstName: user.firstName } }
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
