
import { GoogleGenAI, Type } from "@google/genai";
import { RaceResult, TelemetryPoint, CarState, StrategyRecommendation } from '../types';
import { marked } from "marked";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

async function callGemini(prompt: string, modelName: string = 'gemini-2.5-flash', isJson: boolean = false): Promise<any> {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            ...(isJson && { config: { responseMimeType: "application/json" } })
        });
        
        const text = response.text;
        if (isJson) {
            // Clean the response to ensure it's valid JSON
            const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
            return JSON.parse(cleanedText);
        }
        // FIX: Ensure marked.parse returns a string.
        const parsedHtml = await marked.parse(text);
        return parsedHtml;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `<p class="text-race-red"><strong>Error:</strong> Could not generate analysis. Please check your API key and network connection. Details: ${errorMessage}</p>`;
    }
}


export async function generateHistoryAnalysis(raceData: RaceResult[]): Promise<string> {
    const simplifiedData = raceData.slice(0, 15).map(r => ({
        Pos: r.position,
        Driver: `${r.driverFirstName} ${r.driverSecondName}`,
        Team: r.team,
        Laps: r.laps,
        Gap: r.gapFirst,
        'Fastest Lap': r.fastestLapTime,
    }));

    const prompt = `
        You are "Pit Commander," a world-class race strategist for the Toyota GR Cup.
        Analyze the following final race results from the Indianapolis Motor Speedway.
        Provide a concise, expert summary of the race.

        Focus on:
        1.  The battle for the lead: How close was the finish? Who were the main contenders?
        2.  Standout performances: Mention any drivers who had a particularly impressive result (e.g., a great fastest lap despite a lower finishing position).
        3.  Key strategic takeaways: Based on the gaps and results, what could have been a decisive moment or strategy in this race? Keep it brief and insightful.

        Format your response in Markdown. Use bolding for emphasis.

        Race Results:
        ${JSON.stringify(simplifiedData, null, 2)}
    `;
    return callGemini(prompt);
}


export async function generateStrategyRecommendation(carState: CarState): Promise<StrategyRecommendation> {
    const { lap, position, tireAge, fuel, gapToAhead, gapToLeader } = carState;
    
    const prompt = `
        You are "Pit Commander," an AI race strategist. It is lap ${lap} of 23.
        Analyze the current state of car #${carState.carNumber} and provide a strategy recommendation.
        
        Current State:
        - Position: P${position}
        - Tire Age: ${tireAge} laps
        - Fuel Remaining: ${fuel.toFixed(1)}%
        - Gap to Leader: ${gapToLeader.toFixed(2)}s
        - Gap to Car Ahead: ${gapToAhead.toFixed(2)}s

        Consider these rules:
        - A pit stop costs about 25 seconds.
        - Tires start to degrade significantly after 15-18 laps.
        - The ideal pit window is typically between laps 9 and 14.
        - Low fuel (under 15%) is critical.

        Based on this, provide your recommendation in the following JSON format.
        - recommendation: Choose one of 'PIT_NOW', 'PIT_IN_2_LAPS', 'STAY_OUT', 'PUSH', 'CONSERVE_TIRES'.
        - confidence: A number between 0 and 100.
        - reasoning: A short, clear explanation.
        - color: 'red' for urgent actions (PIT_NOW), 'yellow' for warnings/upcoming actions, 'green' for safe states.
    `;
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            recommendation: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            color: { type: Type.STRING }
        },
        required: ['recommendation', 'confidence', 'reasoning', 'color']
    };

     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    // FIX: Clean up potential markdown and parse the JSON response safely.
    const cleanedText = response.text.replace(/^```json\s*|```\s*$/g, '');
    const parsed = JSON.parse(cleanedText);
    return parsed as StrategyRecommendation;
}

export async function runWhatIfSimulation(scenario: {carNumber: string, decisionLap: number, action: string, originalFinish: number, telemetry: TelemetryPoint[] }): Promise<string> {
    const { carNumber, decisionLap, action, originalFinish, telemetry } = scenario;
    const driverLaps = telemetry.filter(t => t.carNumber === carNumber).map(t => ({ lap: t.lap, lapTime: t.lapTime, position: t.position }));

    const prompt = `
        You are "Pit Commander," an AI race simulation analyst.
        A user wants to know what would have happened in a race at Indianapolis if a different strategy was used for car #${carNumber}.

        Scenario:
        - Car: #${carNumber}
        - Original Finishing Position: P${originalFinish}
        - Decision Point: Lap ${decisionLap}
        - Alternate Action: ${action}
        
        Simulated Race Dynamics:
        - A standard pit stop adds ~25 seconds to a lap time.
        - New tires are worth ~1.5 seconds per lap for the first 5 laps, then the advantage decays.
        - The race is 23 laps long.
        - The driver's original performance is represented by these lap times: ${JSON.stringify(driverLaps.slice(0,15))}

        Analyze this alternate scenario. Predict the new finishing position and explain your reasoning lap-by-lap.
        Format the output in Markdown. Start with a bold "Simulated Outcome" summary, then provide a brief "Analysis" section.
    `;
    return callGemini(prompt);
}


export async function generateDriverAnalysis(driverData: {carNumber: string, telemetry: TelemetryPoint[]}): Promise<string> {
    const { carNumber, telemetry } = driverData;
    const driverLaps = telemetry.filter(t => t.carNumber === carNumber).map(t => ({
        lap: t.lap,
        lapTime: t.lapTime.toFixed(3),
        s1: t.sector1.toFixed(3),
        s2: t.sector2.toFixed(3),
        s3: t.sector3.toFixed(3),
        pos: t.position,
    }));

    if (driverLaps.length === 0) {
        return "<p>No data available for this driver.</p>";
    }

    const bestLap = driverLaps.reduce((best, current) => parseFloat(current.lapTime) < parseFloat(best.lapTime) ? current : best);

    const prompt = `
        You are "Pit Commander," a world-class driver coach.
        Analyze the performance of driver #${carNumber} at Indianapolis based on their lap data.

        Key Data Points:
        - Best Lap: Lap ${bestLap.lap} with a time of ${bestLap.lapTime}s.
        - Lap by Lap Data (first 15 laps): ${JSON.stringify(driverLaps.slice(0, 15), null, 2)}
        
        Provide a concise performance analysis in Markdown format. Focus on:
        1.  **Overall Consistency:** Are the lap times consistent or erratic?
        2.  **Sector Performance:** Is there a specific sector where the driver is consistently strong or weak?
        3.  **Actionable Feedback:** Provide one or two concrete improvement recommendations. For example, "Focus on consistency in Sector 2, where times vary significantly." or "The pace in the final laps suggests good tire management."
    `;

    return callGemini(prompt);
}