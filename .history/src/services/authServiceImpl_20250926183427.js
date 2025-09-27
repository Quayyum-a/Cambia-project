const AuthService = require('./authService');
const AuthResponse = require("../dtos/response/AuthResponse");
const User = require('../models/User');
const Sender = require('../models/Sender');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, useSupabase } = require("../config/env");
const { supabaseService } = require('../db/supabaseClient');
const RegisterValidator = require('../validators/registerValidator')
const LoginValidator = require('../validators/loginValidator')

class AuthServiceImpl extends AuthService {
    constructor() {
        super();
    }

    async register(registerRequest) {
        const validated = RegisterValidator.validate(registerRequest)

        if (useSupabase && supabaseService) {
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

        if (useSupabase && supabaseService) {
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
