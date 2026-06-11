// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingKampus
 * @dev Decentralized Campus Voting System (Multi-Campus)
 * Memungkinkan berbagai kampus (BEM) untuk membuat pemilu sendiri secara transparan di blockchain.
 */
contract VotingKampus {
    
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string campusName;
        string electionName;
        bool isActive;
        Candidate[] candidates;
    }

    // Pemilu disimpan berdasarkan ID unik (0, 1, 2, ...)
    mapping(uint256 => Election) public elections;
    
    // Validasi double-voting: electionId => voterAddress => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Counter jumlah pemilu
    uint256 public electionCount;

    // Events
    event ElectionCreated(
        uint256 indexed electionId, 
        string campusName, 
        string electionName,
        string[] candidates
    );
    event VoteCast(
        uint256 indexed electionId, 
        uint256 indexed candidateId, 
        address indexed voter
    );

    /**
     * @notice Membuat pemilu baru dengan daftar kandidat yang dikunci permanen
     * @param _namaKampus Nama Universitas/Kampus penyelenggara
     * @param _namaPemilu Judul atau nama pemilihan (misal: "Pemilu Raya BEM 2026")
     * @param _namaKandidat Daftar nama kandidat (dikunci sejak pembuatan)
     */
    function createElection(
        string memory _namaKampus,
        string memory _namaPemilu,
        string[] memory _namaKandidat
    ) external returns (uint256) {
        require(bytes(_namaKampus).length > 0, "Nama kampus tidak boleh kosong");
        require(bytes(_namaPemilu).length > 0, "Nama pemilu tidak boleh kosong");
        require(_namaKandidat.length >= 2, "Kandidat minimal harus berjumlah 2");

        uint256 electionId = electionCount;
        Election storage newElection = elections[electionId];
        newElection.id = electionId;
        newElection.campusName = _namaKampus;
        newElection.electionName = _namaPemilu;
        newElection.isActive = true;

        for (uint256 i = 0; i < _namaKandidat.length; i++) {
            newElection.candidates.push(Candidate({
                id: i,
                name: _namaKandidat[i],
                voteCount: 0
            }));
        }

        electionCount++;

        emit ElectionCreated(electionId, _namaKampus, _namaPemilu, _namaKandidat);
        return electionId;
    }

    /**
     * @notice Memberikan hak suara untuk kandidat tertentu dalam suatu pemilu
     * @param _electionId ID Pemilu tujuan
     * @param _candidateId ID Kandidat yang dipilih (0, 1, ...)
     */
    function giveVote(uint256 _electionId, uint256 _candidateId) external {
        require(_electionId < electionCount, "Pemilu tidak ditemukan");
        Election storage election = elections[_electionId];
        require(election.isActive, "Pemilu sudah tidak aktif");
        require(!hasVoted[_electionId][msg.sender], "Anda sudah menggunakan hak pilih Anda di pemilu ini");
        require(_candidateId < election.candidates.length, "Kandidat tidak valid");

        election.candidates[_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;

        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    /**
     * @notice Mengambil informasi dasar pemilu
     * @param _electionId ID Pemilu
     */
    function getElection(uint256 _electionId) external view returns (
        uint256 id,
        string memory campusName,
        string memory electionName,
        bool isActive
    ) {
        require(_electionId < electionCount, "Pemilu tidak ditemukan");
        Election storage election = elections[_electionId];
        return (
            election.id,
            election.campusName,
            election.electionName,
            election.isActive
        );
    }

    /**
     * @notice Mengambil daftar seluruh kandidat beserta perolehan suaranya
     * @param _electionId ID Pemilu
     */
    function getCandidates(uint256 _electionId) external view returns (Candidate[] memory) {
        require(_electionId < electionCount, "Pemilu tidak ditemukan");
        return elections[_electionId].candidates;
    }
}
