"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const transcript_route_1 = __importDefault(require("./routes/transcript.route"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4004;
(0, database_1.connectDB)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true, // Access-Control-Allow-Credentials
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// api routes set up
app.use('/api', transcript_route_1.default);
app.use('/api', authRoutes_1.default);
app.use('/api', adminRoute_1.default);
app.use('/api', userRoute_1.default);
const frontendPath = path_1.default.resolve(__dirname, '../public');
app.use((0, connect_history_api_fallback_1.default)());
app.use(express_1.default.static(frontendPath));
app.get('/{*splat}', (req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server node is running on port ${PORT}`);
});
