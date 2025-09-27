const AuthService = require('./authService');
const AuthResponse = require("../dtos/response/AuthResponse");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require("../config/env");
const { supabaseService } = require('../db/supabaseClient');
const RegisterValidator = require('../validators/registerValidator')
const LoginValidator = require('../validators/loginValidator')

class AuthServiceImpl extends AuthService {
    constructor() {
        super();
    }

    async register(registerRequest) {
        if (!supabaseService) {
            throw new Error('Supabase not configured. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY environment variables in your deployment platform (Railway).');
        }

        const validated = RegisterValidator.validate(registerRequest);

        // Check if user already exists
        const { data: existing, error: errExisting } = await supabaseService
            .from('users')
            .select('id')
            .eq('email', validated.email)
            .maybeSingle();

        if (errExisting) throw new Error(errExisting.message);
        if (existing) throw new Error('Email already exists');

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(validated.password, 10);
        const payload = {
            first_name: validated.firstName,
            last_name: validated.lastName,
            email: validated.email,
            password_hash: hashedPassword,
            role: validated.role,
            wallet_address: validated.walletAddress,
            phone: validated.phone,
            address: validated.address
        };

        const { error: errIns } = await supabaseService.from('users').insert(payload);
        if (errIns) throw new Error(errIns.message);

        return new AuthResponse("User registered successfully", true);
    }

    async login(loginRequest) {
        if (!supabaseService) {
            throw new Error('Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
        }

        const validated = LoginValidator.validate(loginRequest);

        // Find user in Supabase
        const { data: user, error } = await supabaseService
            .from('users')
            .select('id, email, password_hash, role, first_name, wallet_address')
            .eq('email', validated.email)
            .single();

        if (error || !user) throw new Error('Invalid email or password');

        // Verify password
        const isPasswordValid = await bcrypt.compare(validated.password, user.password_hash || '');
        if (!isPasswordValid) throw new Error('Invalid email or password');

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, walletAddress: user.wallet_address },
            jwtSecret,
            { expiresIn: '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                walletAddress: user.wallet_address,
                firstName: user.first_name
            }
        };
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
