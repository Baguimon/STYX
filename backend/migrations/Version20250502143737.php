<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250502143737 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE club (id INT AUTO_INCREMENT NOT NULL, club_captain_id INT NOT NULL, name VARCHAR(100) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_B8EE38727A803C76 (club_captain_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE club_user (club_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_E95B1CA961190A32 (club_id), INDEX IDX_E95B1CA9A76ED395 (user_id), PRIMARY KEY(club_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club ADD CONSTRAINT FK_B8EE38727A803C76 FOREIGN KEY (club_captain_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user ADD CONSTRAINT FK_E95B1CA961190A32 FOREIGN KEY (club_id) REFERENCES club (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user ADD CONSTRAINT FK_E95B1CA9A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE club DROP FOREIGN KEY FK_B8EE38727A803C76
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user DROP FOREIGN KEY FK_E95B1CA961190A32
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE club_user DROP FOREIGN KEY FK_E95B1CA9A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE club
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE club_user
        SQL);
    }
}
