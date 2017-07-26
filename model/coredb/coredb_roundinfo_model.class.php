<?php
require_once "../classes/lib/mydbo.php";
/**
 * 場次成績紀錄
 *
 */
class CoreDB_RoundInfo_Model extends MyDBModel
{
    protected $schema = array(
        'RoundID'        => 'int',
        'RoundScore'     => 'string',
        'RoundRecord'    => 'int',
        'RoundCounter'   => 'int',
    );

    public function addRoundScore($_sRoundScore, $_iRoundRecord, $_iRoundCounter) {
        return $this->insert(array(
            'RoundScore' => $_sRoundScore, 
            'RoundRecord' => $_iRoundRecord, 
            'RoundCounter' => $_iRoundCounter
        ));
    }

    public function getOneRoundInfo() {
        $sSql = "SELECT RoundRecord, RoundCounter FROM roundinfo ORDER BY RoundCounter desc";
        return $this->select_one($sSql);
    }

    public function getAllRoundInfo() {
        $sSql = "SELECT RoundRecord, RoundScore FROM roundinfo ORDER BY RoundCounter asc";
        return $this->select_all($sSql);
    }

    public function deleteAllRoundInfo() {
        $sSql = "DELETE FROM roundinfo";
        return $this->query($sSql);
    }
}
