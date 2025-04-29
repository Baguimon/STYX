<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class UserFixture extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $user = new User();
            $user->setUsername('User' . $i);
            $user->setEmail('user' . $i . '@example.com');
            $user->setPassword('password' . $i); // Ici on ne chiffre pas encore le mot de passe
            $user->setCreatedAt(new \DateTimeImmutable());
            $user->setRole('ROLE_USER');
            $user->setLevel('Débutant');
            $user->setClubId($i); // Valeur fictive pour test

            $manager->persist($user);
        }

        $manager->flush();
    }
}

