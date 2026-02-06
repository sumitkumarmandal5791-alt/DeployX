const Bin = require('../Schema/smartBin');
const Alert = require('../Schema/alertSchema');

module.exports = (io) => {
    console.log("🚀 Simulator Started: Updating bins every 5 seconds...");

    setInterval(async () => {
        try {
            const bins = await Bin.find();

            for (const bin of bins) {
                // 1. Simulate Realistic Pattern
                // 95% chance to fill slowly (0-3%), 5% chance of big deposit (10%)
                const increase = Math.random() > 0.95 ? 10 : Math.floor(Math.random() * 3);

                let newLevel = (bin.fillLevel || 0) + increase;

                // 2. Simulate "Collection" (Auto-empty) if full
                if (newLevel >= 100) {
                    newLevel = 0;
                    // Optional: You could log "Collection Truck Arrived" here
                }

                // 2. Update DB if changed
                if (newLevel !== bin.fillLevel) {
                    bin.fillLevel = newLevel;

                    // Check Logic for Status
                    if (bin.status !== 'MAINTENANCE' && bin.status !== 'OFFLINE') {
                        if (newLevel >= 90) bin.status = 'FULL';
                        else bin.status = 'ACTIVE';
                    }

                    await bin.save();

                    // 3. Emit Socket Event
                    io.emit('binUpdate', {
                        _id: bin._id,
                        fillLevel: bin.fillLevel,
                        status: bin.status
                    });

                    // 4. Trigger Alert if Critical
                    if (newLevel >= 90) {
                        const existingAlert = await Alert.findOne({
                            bin: bin._id,
                            status: 'ACTIVE',
                            type: 'CRITICAL'
                        });

                        if (!existingAlert) {
                            const alert = await Alert.create({
                                bin: bin._id,
                                type: 'CRITICAL',
                                message: `Bin ${bin.binName} is ${newLevel}% full!`,
                                status: 'ACTIVE'
                            });

                            io.emit('newAlert', alert);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Simulator Error:", error);
        }
    }, 5000); // Run every 5 seconds
};
