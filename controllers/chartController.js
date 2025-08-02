import Student from "../models/Student.js"

export const chartLogic = async (req, res) => {
    try {
        const data = await Student.aggregate([
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    department: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch department chart data' });
    }
}




export const courseChartLogic = async (req, res) => {
    try {
        const data = await Student.aggregate([
            {
                $group: {
                    _id: '$course',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    course: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch course chart data' });
    }
}


export const ageChart = async (req, res) => {
    try {
        const data = await Student.aggregate([
            {
                $group: {
                    _id: '$age',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    age: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch course chart data' });
    }
}