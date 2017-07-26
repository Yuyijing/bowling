<?php
require_once "../classes/lib/mydbo.php";
/**
 * 歷史分數排名
 *
 */
class CoreDB_ScoreInfo_Model extends MyDBModel
{
    protected $schema = array(
        'ScoreID'        => 'int',
        'Score'          => 'int',
        'Name'     		 => 'string',
    );

    //分數輸入
    public function addScore($_sName, $_iScore) {
    	return $this->insert(array(
            'Score' => $_iScore, 
            'Name' => $_sName, 
            ));
    }

    //分數取得
    public function getScore() {
    	$sSql = "SELECT * from scoreinfo ORDER BY Score DESC";
    	return $aScoreList = $this->select_all($sSql);
    }

}