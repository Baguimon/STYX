<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250526222017 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players DROP FOREIGN KEY FK_ED8C843DA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players DROP FOREIGN KEY FK_ED8C843DE48FD905
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE game_team2_players
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game DROP FOREIGN KEY FK_232B318C3C865CA3
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_232B318C3C865CA3 ON game
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game DROP players_team1_id
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE game_team2_players (game_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_ED8C843DA76ED395 (user_id), INDEX IDX_ED8C843DE48FD905 (game_id), PRIMARY KEY(game_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players ADD CONSTRAINT FK_ED8C843DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game_team2_players ADD CONSTRAINT FK_ED8C843DE48FD905 FOREIGN KEY (game_id) REFERENCES game (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game ADD players_team1_id INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE game ADD CONSTRAINT FK_232B318C3C865CA3 FOREIGN KEY (players_team1_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_232B318C3C865CA3 ON game (players_team1_id)
        SQL);
    }
}
