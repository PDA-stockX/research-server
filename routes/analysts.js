const express = require('express');
const router = express.Router();

const {initModels} = require('../models/initModels');
const {Op} = require("sequelize");
const models = initModels();

// 애널리스트 총 수익률, 총 달성률 추가 :
async function updateAnalystRates() {
    try {
        // Analyst 테이블의 모든 레코드 가져오기
        const analysts = await models.Analyst.findAll();

        // Analyst 별로 업데이트 수행
        for (const analyst of analysts) {
            // 이미 값이 있는 경우에는 계산하지 않음
            if (analyst.returnRate !== null && analyst.achievementRate !== null) {
                continue;
            }

            // Analyst의 id에 해당하는 Report 데이터 가져오기
            const reports = await models.Report.findAll({
                where: {
                    analystId: analyst.id,
                },
                include: {
                    model: models.ReportSector,
                    attributes: ['sectorId'],
                    include: {
                        model: models.Sector,
                        attributes: ['name'],
                    },
                }
            });

            // Report 데이터에서 returnRate와 achievementScore 합산
            const totalReturnRate = reports.reduce((sum, report) => sum + report.returnRate, 0);
            const totalAchievementScore = reports.reduce((sum, report) => sum + report.achievementScore, 0);

            // returnRate와 achievementScore의 평균값 계산
            const averageReturnRate = reports.length > 0 ? totalReturnRate / reports.length : 0;
            const averageAchievementScore = reports.length > 0 ? totalAchievementScore / reports.length : 0;

            // // Analyst가 쓴 리포트의 업종명을 배열로 저장
            // const sectorNames = Array.from(new Set(reports.flatMap(report => report.ReportSectors.map(rs => rs.Sector.name))));

            // Analyst 데이터 업데이트
            await models.Analyst.update(
                {
                    returnRate: averageReturnRate,
                    achievementRate: averageAchievementScore,
                },
                {
                    where: { id: analyst.id },
                }
            );
        }

        console.log('Analyst rates calculation and update successful.');
    } catch (error) {
        console.error('Error updating analyst rates:', error);
    }
}

// 수익률 및 달성률에 대한 정렬 기준
async function getAnalystRankings(orderBy, res) {
    try {
        // 오늘 날짜
        const today = new Date();

        // updateAnalystRates 함수 호출
        await updateAnalystRates();

        // Analyst 테이블에서 name, firm, returnRate, achievementRate 가져오기
        const analystData = await models.Analyst.findAll({
            attributes: ['id', 'name', 'firm', 'returnRate', 'achievementRate'],
        });

        // Analyst 별 업종명 배열 가져오기
        const analystSectors = await models.Report.findAll({
            attributes: ['analystId'],
            include: {
                model: models.ReportSector,
                attributes: [],
                include: {
                    model: models.Sector,
                    attributes: ['name'],
                },
            },
            raw: true,
            nest: true,
        });

        const analystSectorMap = {};
        analystSectors.forEach((report) => {
            const analystId = report.analystId;
            if (!analystSectorMap[analystId]) {
                analystSectorMap[analystId] = [];
            }

            analystSectorMap[analystId].push(
                ...Array.from(new Set(report.ReportSectors.map((rs) => rs.Sector.name)))
            );
        });

        Object.keys(analystSectorMap).forEach((analystId) => {
            analystSectorMap[analystId] = Array.from(new Set(analystSectorMap[analystId]));
        });

        // Analyst에 대한 정보 정렬하기
        const sortedAnalystData = analystData.map((analyst) => ({
            id: analyst.id,
            name: analyst.name,
            firm: analyst.firm,
            returnRate: analyst.returnRate,
            achievementRate: analyst.achievementRate,
            sectorNames: analystSectorMap[analyst.id] || [],
        }));

        // Analyst 기준으로 정렬
        const sortedAnalystRankings = sortedAnalystData.sort((a, b) => b[orderBy] - a[orderBy]);

        res.json(sortedAnalystRankings);

    } catch (err) {
        console.error(`Error retrieving analyst data (${orderBy}):`, err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// 애널리스트 수익률 순위 조회 : /api/analysts/earning-rate
router.get('/earning-rate', async (req, res, next) => {
    await getAnalystRankings('returnRate', res);
});


// 애널리스트 달성률 순위 조회 : /api/analysts/achievement-rate
router.get('/achievement-rate', async (req, res, next) => {
    await getAnalystRankings('achievementRate', res);
});


// 업종별 애널리스트 순위 조회 : /api/analysts?sector={업종명}
router.get('/', async (req, res, next) => {
    try {
        // 받은 업종명
        const sectorName = req.query.sector;

        if (!sectorName) {
            return res.status(400).json({ message: '업종명을 제공해야 합니다.' });
        }

        // 오늘 날짜
        const today = new Date();

        // updateAnalystRates 함수 호출
        await updateAnalystRates();

        // 특정 업종에 속한 애널리스트들의 리포트 가져오기
        const reports = await models.Report.findAll({
            include: [
                {
                    model: models.ReportSector,
                    attributes: [],
                    include: {
                        model: models.Sector,
                        attributes: ['name'],
                        where: { name: sectorName },
                    },
                },
                {
                    model: models.Analyst,
                    attributes: ['id', 'name', 'firm'],
                },
            ],
        });

        // Report 데이터에서 returnRate와 achievementScore 합산
        const totalReturnRate = reports.reduce((sum, report) => sum + report.returnRate, 0);
        const totalAchievementScore = reports.reduce((sum, report) => sum + report.achievementScore, 0);

        // returnRate와 achievementScore의 평균값 계산
        const averageReturnRate = reports.length > 0 ? totalReturnRate / reports.length : 0;
        const averageAchievementScore = reports.length > 0 ? totalAchievementScore / reports.length : 0;


        // 애널리스트에 대한 정보 정렬하기
        const sortedAnalystData = reports.map((report) => ({
            id: report.Analyst.id,
            name: report.Analyst.name,
            firm: report.Analyst.firm,
            returnRate: averageReturnRate,
            achievementRate: averageAchievementScore,
            sector: sectorName
        }));

        // 일단 수익률 기준으로 정렬
        const sortedAnalystRankings = sortedAnalystData.sort((a, b) => b.returnRate - a.returnRate);

        res.json(sortedAnalystRankings);

    } catch (err) {
        console.error('Error retrieving analyst data by sector:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// 애널리스트 즐겨찾기 순위 조회 : /api/analysts/follower-rank
router.get('/follower-rank', async (req, res, next) => {
    try {
        // 팔로워 수를 기준으로 애널리스트 정렬
        const rankedAnalysts = await models.Analyst.findAll({
            attributes: ['id', 'name', 'firm'],
            include: [
                {
                    model: models.User,  // Follow 테이블을 통해 User와 연결
                    as: 'Followers',  // 팔로워들
                    attributes: [],
                },
            ],
            order: [
                [sequelize.literal('Followers.count'), 'DESC'],  // Followers.count로 정렬
            ],
            group: ['Analyst.id'],  // Analyst별로 그룹화하여 팔로워 수를 계산
        });

        // 결과 정리
        const followerRankings = rankedAnalysts.map((analyst) => ({
            id: analyst.id,
            name: analyst.name,
            firm: analyst.firm,
            followerCount: analyst.Followers.length,
        }));

        res.json(followerRankings);
    } catch (err) {
        console.error('Error retrieving analyst follower rankings:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;