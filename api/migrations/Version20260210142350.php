<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260210142350 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE post_genres (post_id INT NOT NULL, taxonomy_id INT NOT NULL, PRIMARY KEY (post_id, taxonomy_id))');
        $this->addSql('CREATE INDEX IDX_98C901734B89032C ON post_genres (post_id)');
        $this->addSql('CREATE INDEX IDX_98C901739557E6F6 ON post_genres (taxonomy_id)');
        $this->addSql('ALTER TABLE post_genres ADD CONSTRAINT FK_98C901734B89032C FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE post_genres ADD CONSTRAINT FK_98C901739557E6F6 FOREIGN KEY (taxonomy_id) REFERENCES taxonomies (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE post_genres DROP CONSTRAINT FK_98C901734B89032C');
        $this->addSql('ALTER TABLE post_genres DROP CONSTRAINT FK_98C901739557E6F6');
        $this->addSql('DROP TABLE post_genres');
    }
}
