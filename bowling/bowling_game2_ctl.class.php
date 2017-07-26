<?php
require_once "../classes/model/coredb/coreDB_scoreinfo_model.class.php";
require_once "../classes/model/coredb/coreDB_roundinfo_model.class.php";

class Bowling_Game2_Ctl extends Controller
{

    public $endflag = false;

    public function get_index() {
        //刪除之前資料
        $oModel = new CoreDB_RoundInfo_Model;
        $aRoundInfo = $oModel->deleteAllRoundInfo();
        //載入歷史分數
        $oModel = new CoreDB_ScoreInfo_Model();
        $aScoreList = $oModel->getScore();
        return Smarty_View::make('home/index.html', array('scorelist' => $aScoreList));
    }

    public function get_start() {

        //取得當前分數
        $iRoundRecord = Input::get('i', 'value');

        //取得前一球資訊
        $oModel = new CoreDB_RoundInfo_Model;
        $aRoundInfo = $oModel->getOneRoundInfo();

        //給定初始值
        if (!$aRoundInfo) {
            $aRoundInfo['RoundRecord'] = 0;
            $aRoundInfo['RoundCounter'] = 1;
        }

        //紀錄局分
        $sRoundScore = $this->registerRoll($iRoundRecord, $aRoundInfo);
        if ($sRoundScore == "X") {
            $iRoundCounter = $aRoundInfo['RoundCounter'] + 2;
        } else {
            $iRoundCounter = $aRoundInfo['RoundCounter'] + 1;
        }
        $oModel->addRoundScore($sRoundScore, $iRoundRecord, $iRoundCounter);
        
        //顯示每球資訊
        $aRoundInfo = $oModel->getAllRoundInfo();

        //計算每局分數
        $nowframe = ceil($iRoundCounter / 2);
        foreach ($aRoundInfo as $key => $value) {
            $aRecord[] = (int)$value['RoundRecord'];
            $aScore[] = $value['RoundScore'];
        }
        $aFrameScore = $this->cumulativeScore($aRecord, $nowframe);

        //打包JSON
        $aJSON = array(
            'endflag' => $this->endflag,
            'roundcounter' => $iRoundCounter,
            'framescore' => $aFrameScore,
            'roundscore' => $aScore
            );
        return json_encode($aJSON);       
        // return Smarty_View::make('home/index.html', array('roundInfo' => $aRoundInfo, 'frameScore' => $aFrameScore, 'scorelist' => $aScoreList));
    }

    public function get_score() {
    	$sName = Input::get('s', 'Name');
        $sScore = Input::get('s', 'Score');
        // return $sScore;
        $oModel = new CoreDB_ScoreInfo_Model;
    	$oModel->addScore($sName, (int)$sScore);
    	return "OK";
    }

    public  function registerRoll($_iRoundRecord, $_aRoundInfo) {
        $GLOBALS['roundRecord'] = $_iRoundRecord;
        $GLOBALS['roundInfo'] = $_aRoundInfo;
        //第10局
        function tenthFrame () {
            global $roundInfo;
            return $roundInfo['RoundCounter'] > 19;
        }
        //全倒
        function isStrike() {
            global $roundRecord;
            return $roundRecord === 10;
        }
        //一局結束
        function isFrameEnd() {
            global $roundInfo;
            return $roundInfo['RoundCounter'] % 2 === 0;
        }
        //spare
        function isSpare() {
            global $roundInfo, $roundRecord;
            return $roundRecord + $roundInfo['RoundRecord'] === 10;
        }
        //是否spare
        function decideSpare() {
            global $roundRecord;
            if (isSpare()){
                return "/";
            } else {
                return "$roundRecord";
            };
        }

        function pushScore() {
            global $roundRecord;
            return "$roundRecord";
        }
        //洗溝
        function isDitch() {
            global $roundRecord;
            return $roundRecord === 0;
        }

        //是否為第10局
        if (tenthFrame()){
            if (isStrike()) {
                return "X";
            } else if($_aRoundInfo['RoundRecord'] != 10) {
                if (isFrameEnd() && isSpare()) {
                    return "/";
                } else {
                    $this->endflag = true;
                    return (isDitch()) ? "-" : pushScore();
                }
            } 
        } else if (isStrike() && !isFrameEnd()) {
            return "X";
        } else if (isDitch()) {
            return "-";
        } else if (isFrameEnd()) {
            return decideSpare();
        } else {                    
            return pushScore();
        }
    }

    public function cumulativeScore($_aRecord, $_nowframe) {

        $GLOBALS['record'] = $_aRecord;

        function checkStrike ($_iFrameStart) {
            global $record;
            return $record[$_iFrameStart] === 10;
        }

        function checkSpare ($_iFrameStart) {
            global $record;
            return $record[$_iFrameStart] + $record[$_iFrameStart + 1] === 10;
        }

        function frameTotal ($_iFrameStart) {
            global $record;
            return $record[$_iFrameStart] + $record[$_iFrameStart + 1];
        }

        function strikeBonus ($_iFrameStart) {
            global $record;
            if ($record[$_iFrameStart + 1] === null || $record[$_iFrameStart + 2] === null) {
                return null;
            } else {
                return $record[$_iFrameStart + 1] + $record[$_iFrameStart + 2];
            }
        }

        function spareBonus ($_iFrameStart) {
            global $record;
            if ($record[$_iFrameStart + 2] === null) {
                return null;
            } else {
                return $record[$_iFrameStart + 2];
            }
        }

        for ($j=1; $j < $_nowframe; $j++) {
            $iScore = 0;
            $iFrameStart = 0;
            for ($i = 0; $i < $j; $i ++){
                if(checkStrike($iFrameStart)){
                    if (strikeBonus($iFrameStart) === null) {  
                        $iScore = "";
                    } else {
                        $iScore += 10 + strikeBonus($iFrameStart);
                    }
                    $iFrameStart ++;
                } else if (checkSpare($iFrameStart)){
                    if (spareBonus($iFrameStart) === null) {
                        $iScore = "";
                    } else {
                        $iScore += 10 + spareBonus($iFrameStart);
                    }
                    $iFrameStart += 2;
                } else {
                    $iScore += (int)frameTotal($iFrameStart);
                    $iFrameStart += 2;
                }
            }
            $aFrameScore[$j] = $iScore;
        }
        return $aFrameScore;
    }
} 
