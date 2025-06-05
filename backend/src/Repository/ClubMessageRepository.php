<?php

// src/Repository/ClubMessageRepository.php
namespace App\Repository;

use App\Entity\ClubMessage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ClubMessage>
 */
class ClubMessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ClubMessage::class);
    }
}
